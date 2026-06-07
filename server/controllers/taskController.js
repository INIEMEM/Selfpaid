const Task = require("../models/Task");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { uploadToS3 } = require("../utils/uploadToS3");
const createNotification = require("../utils/createNotification");

const VALID_CATEGORIES = ["social", "writing", "marketing", "tech", "data", "design", "research", "other"];

// ─── Validation helper ─────────────────────────────────────────────────────────

const validateTaskFields = ({ title, description, reward, category, deadline }) => {
  if (!title || title.trim().length < 5 || title.trim().length > 100)
    return "Title must be between 5 and 100 characters";
  if (!description || description.trim().length < 20 || description.trim().length > 2000)
    return "Description must be between 20 and 2000 characters";
  if (reward === undefined || reward === null || isNaN(reward) || Number(reward) < 1)
    return "Reward must be a number of at least 1";
  if (!category || !VALID_CATEGORIES.includes(category))
    return `Category must be one of: ${VALID_CATEGORIES.join(", ")}`;
  if (!deadline || new Date(deadline) <= new Date())
    return "Deadline must be a future date";
  return null;
};

// ═══════════════════════════════════════════════════════════════════════════════
// CREATOR CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════════

const createTask = async (req, res, next) => {
  try {
    const { title, description, reward, category, deadline } = req.body;

    const validationError = validateTaskFields({ title, description, reward: Number(reward), category, deadline });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const creator = await User.findById(req.user.id);
    if (creator.walletBalance < Number(reward)) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance to post this task" });
    }

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      reward: Number(reward),
      category,
      deadline: new Date(deadline),
      creator: req.user.id,
      status: "pending_approval",
    });

    // Deduct from wallet, add to escrow
    creator.walletBalance -= Number(reward);
    creator.escrowBalance += Number(reward);

    await Transaction.create({
      user: req.user.id,
      type: "escrow_lock",
      amount: Number(reward),
      status: "completed",
      taskRef: task._id,
      description: `Escrow locked for task: ${task.title}`,
      processedAt: new Date(),
    });

    await task.save();
    await creator.save();

    return res.status(201).json({
      success: true,
      message: "Task submitted for admin approval",
      task,
    });
  } catch (error) {
    next(error);
  }
};

const getCreatorTasks = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const query = { creator: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;

    const result = await Task.paginate(query, {
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 },
      populate: { path: "worker", select: "firstName lastName profilePhoto" },
    });

    return res.status(200).json({
      success: true,
      tasks: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      total: result.totalDocs,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, creator: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (task.status !== "pending_approval") {
      return res.status(400).json({ success: false, message: "Task can only be edited before admin approval" });
    }

    const { title, description, category, deadline } = req.body;

    const validationError = validateTaskFields({
      title: title || task.title,
      description: description || task.description,
      reward: task.reward,
      category: category || task.category,
      deadline: deadline || task.deadline,
    });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    if (title) task.title = title.trim();
    if (description) task.description = description.trim();
    if (category) task.category = category;
    if (deadline) task.deadline = new Date(deadline);

    await task.save();

    return res.status(200).json({ success: true, message: "Task updated", task });
  } catch (error) {
    next(error);
  }
};

const cancelTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, creator: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (task.status === "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a task that is in progress. Please raise a dispute.",
      });
    }

    if (!["pending_approval", "open"].includes(task.status)) {
      return res.status(400).json({ success: false, message: "This task cannot be cancelled at its current stage" });
    }

    const { cancellationReason } = req.body;

    task.status = "cancelled";
    task.cancellationReason = cancellationReason || "";
    task.fundsRefunded = true;

    // Refund reward to creator
    const creator = await User.findById(req.user.id);
    creator.walletBalance += task.reward;
    creator.escrowBalance -= task.reward;

    await task.save();
    await creator.save();

    return res.status(200).json({ success: true, message: "Task cancelled and funds refunded", task });
  } catch (error) {
    next(error);
  }
};

const selectWorker = async (req, res, next) => {
  try {
    const { workerId } = req.body;
    const task = await Task.findOne({ _id: req.params.id, creator: req.user.id, status: "open" });
    if (!task) return res.status(404).json({ success: false, message: "Task not found or not open" });

    const isApplicant = task.applicants.some((id) => id.toString() === workerId);
    if (!isApplicant) {
      return res.status(400).json({ success: false, message: "This user has not applied for this task" });
    }

    task.worker = workerId;
    task.status = "in_progress";

    await task.save();

    await createNotification(
      workerId,
      "worker_selected",
      `You have been selected for the task: ${task.title}`,
      task._id
    );

    return res.status(200).json({ success: true, message: "Worker selected. Task is now in progress.", task });
  } catch (error) {
    next(error);
  }
};

const reviewSubmission = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body;
    const task = await Task.findOne({ _id: req.params.id, creator: req.user.id, status: "submitted" });
    if (!task) return res.status(404).json({ success: false, message: "Task not found or no submission to review" });

    if (action === "approve") {
      const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE) || 0.10;
      const platformFee = parseFloat((task.reward * commissionRate).toFixed(2));
      const workerPayout = parseFloat((task.reward - platformFee).toFixed(2));

      const worker = await User.findById(task.worker);
      const creator = await User.findById(req.user.id);

      worker.walletBalance += workerPayout;
      // SPX Engagement Reward
      worker.tokenBalance = (worker.tokenBalance || 0) + 50;
      creator.escrowBalance -= task.reward;

      task.status = "completed";
      task.escrowReleased = true;

      await worker.save();
      await creator.save();
      await task.save();

      await Transaction.create({
        user: task.worker,
        type: "task_payment",
        amount: workerPayout,
        status: "completed",
        taskRef: task._id,
        description: `Payment for task: ${task.title} (after 10% platform fee)`,
        processedAt: Date.now()
      });

      const PlatformRevenue = require("../models/PlatformRevenue");
      await PlatformRevenue.create({
        type: "task_commission",
        amount: platformFee,
        taskRef: task._id,
        workerRef: task.worker,
        creatorRef: task.creator,
        description: `10% commission on task: ${task.title}`
      });

      await createNotification(
        task.worker,
        "payment_received",
        `You received $${workerPayout} for completing: ${task.title}`,
        task._id
      );

      await createNotification(
        task.creator,
        "task_completed",
        `Your task "${task.title}" has been completed`,
        task._id
      );

      return res.status(200).json({ success: true, message: "Task approved. Payment released to worker." });
    }

    if (action === "reject") {
      if (!rejectionReason) {
        return res.status(400).json({ success: false, message: "Rejection reason is required" });
      }

      task.status = "in_progress";
      task.rejectionReason = rejectionReason;
      task.submission = { text: "", fileUrl: "", fileName: "", submittedAt: null };

      await task.save();

      await createNotification(
        task.worker,
        "submission_rejected",
        `Your submission was rejected. Reason: ${rejectionReason}. Please resubmit.`,
        task._id
      );

      return res.status(200).json({ success: true, message: "Submission rejected. Worker can resubmit." });
    }

    return res.status(400).json({ success: false, message: "Invalid action" });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// WORKER CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════════

const browseTasks = async (req, res, next) => {
  try {
    const { category, minReward, maxReward, page = 1, limit = 10 } = req.query;

    const query = { status: "open" };
    if (category) query.category = category;
    if (minReward || maxReward) {
      query.reward = {};
      if (minReward) query.reward.$gte = Number(minReward);
      if (maxReward) query.reward.$lte = Number(maxReward);
    }

    const result = await Task.paginate(query, {
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 },
      populate: { path: "creator", select: "firstName lastName profilePhoto averageRating" },
    });

    return res.status(200).json({
      success: true,
      tasks: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      total: result.totalDocs,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("creator", "firstName lastName profilePhoto averageRating")
      .populate("worker", "firstName lastName profilePhoto")
      .populate("applicants", "firstName lastName profilePhoto");

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    return res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

const applyForTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, status: "open" });
    if (!task) return res.status(404).json({ success: false, message: "Task not found or not open" });

    const alreadyApplied = task.applicants.some((id) => id.toString() === req.user.id.toString());
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: "You have already applied for this task" });
    }

    if (task.applicants.length >= task.maxApplicants) {
      return res.status(400).json({ success: false, message: "This task has reached maximum applicants" });
    }

    task.applicants.push(req.user.id);
    await task.save();

    await createNotification(
      task.creator,
      "new_applicant",
      `A new worker applied for your task: ${task.title}`,
      task._id
    );

    return res.status(200).json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    next(error);
  }
};

const getWorkerTasks = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { worker: req.user.id };
    if (status) query.status = status;

    const result = await Task.paginate(query, {
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 },
      populate: { path: "creator", select: "firstName lastName profilePhoto" },
    });

    return res.status(200).json({
      success: true,
      tasks: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      total: result.totalDocs,
    });
  } catch (error) {
    next(error);
  }
};

const submitTaskWork = async (req, res, next) => {
  try {
    const { submissionText } = req.body;
    const task = await Task.findOne({ _id: req.params.id, worker: req.user.id, status: "in_progress" });
    if (!task) return res.status(404).json({ success: false, message: "Task not found or not assigned to you" });

    if (!submissionText && !req.file) {
      return res.status(400).json({ success: false, message: "Please provide submission text or upload a file" });
    }

    let fileUrl = "";
    let fileName = "";

    if (req.file) {
      try {
        fileUrl = await uploadToS3({
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
          folder: "task-submissions",
        });
        fileName = req.file.originalname;
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: "File upload failed, please try again" });
      }
    }

    task.submission = {
      text: submissionText || "",
      fileUrl,
      fileName,
      submittedAt: new Date(),
    };
    task.status = "submitted";

    await task.save();

    await createNotification(
      task.creator,
      "submission_received",
      `A submission was received for your task: ${task.title}`,
      task._id
    );

    return res.status(200).json({
      success: true,
      message: "Work submitted successfully. Awaiting creator review.",
      task,
    });
  } catch (error) {
    next(error);
  }
};

const raiseDispute = async (req, res, next) => {
  try {
    const { disputeReason } = req.body;
    if (!disputeReason) {
      return res.status(400).json({ success: false, message: "Dispute reason is required" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ creator: req.user.id }, { worker: req.user.id }],
      status: { $in: ["in_progress", "submitted"] },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found or cannot be disputed at this stage" });
    }

    task.status = "disputed";
    task.disputeReason = disputeReason;

    await task.save();

    return res.status(200).json({ success: true, message: "Dispute raised. Admin will review shortly.", task });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════════

const adminGetPendingTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ status: "pending_approval" })
      .populate("creator", "firstName lastName email profilePhoto")
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, tasks, total: tasks.length });
  } catch (error) {
    next(error);
  }
};

const adminReviewTask = async (req, res, next) => {
  try {
    const { action, adminNote } = req.body;
    const task = await Task.findOne({ _id: req.params.id, status: "pending_approval" });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (action === "approve") {
      task.status = "open";
      task.approvedByAdmin = true;
      task.approvedAt = new Date();
      if (adminNote) task.adminNote = adminNote;

      await task.save();

      await createNotification(
        task.creator,
        "task_approved",
        `Your task "${task.title}" has been approved and is now live`,
        task._id
      );

      return res.status(200).json({ success: true, message: "Task approved and is now live", task });
    }

    if (action === "reject") {
      if (!adminNote) {
        return res.status(400).json({ success: false, message: "Admin note is required when rejecting a task" });
      }

      const creator = await User.findById(task.creator);
      creator.walletBalance += task.reward;
      creator.escrowBalance -= task.reward;

      task.status = "cancelled";
      task.adminNote = adminNote;
      task.fundsRefunded = true;

      await Promise.all([task.save(), creator.save()]);

      await createNotification(
        task.creator,
        "task_rejected",
        `Your task "${task.title}" was rejected. Reason: ${adminNote}`,
        task._id
      );

      return res.status(200).json({ success: true, message: "Task rejected and funds refunded to creator" });
    }

    return res.status(400).json({ success: false, message: "Invalid action" });
  } catch (error) {
    next(error);
  }
};

const adminGetDisputedTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ status: "disputed" })
      .populate("creator", "firstName lastName email profilePhoto")
      .populate("worker", "firstName lastName email profilePhoto")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, tasks, total: tasks.length });
  } catch (error) {
    next(error);
  }
};

const adminResolveDispute = async (req, res, next) => {
  try {
    const { winner, adminNote } = req.body;

    if (!winner || !adminNote) {
      return res.status(400).json({ success: false, message: "Winner and admin note are required" });
    }

    const task = await Task.findOne({ _id: req.params.id, status: "disputed" });
    if (!task) return res.status(404).json({ success: false, message: "Disputed task not found" });

    const creator = await User.findById(task.creator);

    if (winner === "worker") {
      const worker = await User.findById(task.worker);
      worker.walletBalance += task.reward;
      creator.escrowBalance -= task.reward;
      task.status = "completed";
      task.escrowReleased = true;
      await worker.save();
    } else if (winner === "creator") {
      creator.walletBalance += task.reward;
      creator.escrowBalance -= task.reward;
      task.status = "cancelled";
      task.fundsRefunded = true;
    } else {
      return res.status(400).json({ success: false, message: "Winner must be 'creator' or 'worker'" });
    }

    task.adminNote = adminNote;

    await Promise.all([task.save(), creator.save()]);

    return res.status(200).json({ success: true, message: "Dispute resolved", task });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getCreatorTasks,
  updateTask,
  cancelTask,
  selectWorker,
  reviewSubmission,
  browseTasks,
  getTaskById,
  applyForTask,
  getWorkerTasks,
  submitTaskWork,
  raiseDispute,
  adminGetPendingTasks,
  adminReviewTask,
  adminGetDisputedTasks,
  adminResolveDispute,
};
