const Rating = require("../models/Rating");
const Task = require("../models/Task");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

const submitRating = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { score, review } = req.body;

    const task = await Task.findOne({ _id: taskId, status: "completed" });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found or not completed yet" });
    }

    let role, ratedUser;
    if (req.user.id === task.creator.toString()) {
      role = "creator_rating_worker";
      ratedUser = task.worker;
    } else if (req.user.id === task.worker.toString()) {
      role = "worker_rating_creator";
      ratedUser = task.creator;
    } else {
      return res.status(403).json({ success: false, message: "You are not part of this task" });
    }

    const existingRating = await Rating.findOne({ task: taskId, ratedBy: req.user.id });
    if (existingRating) {
      return res.status(400).json({ success: false, message: "You have already rated this task" });
    }

    if (!score || !Number.isInteger(Number(score)) || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: "Score must be an integer between 1 and 5" });
    }

    const rating = await Rating.create({
      task: taskId,
      ratedBy: req.user.id,
      ratedUser,
      role,
      score: Number(score),
      review: review || "",
    });

    // Recalculate average rating
    const allRatings = await Rating.find({ ratedUser: ratedUser });
    const totalRatings = allRatings.length;
    const averageRating = allRatings.reduce((sum, r) => sum + r.score, 0) / totalRatings;
    const trustScore = Math.round(averageRating * 20); // 5-star scale to 100%

    await User.findByIdAndUpdate(ratedUser, { averageRating, totalRatings, trustScore });

    await createNotification(
      ratedUser,
      "general",
      `You received a ${score}-star rating for task: ${task.title}`
    );

    return res.status(201).json({ success: true, message: "Rating submitted", rating });
  } catch (error) {
    next(error);
  }
};

const getUserRatings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { ratedUser: userId };
    if (role) query.role = role;

    const [ratings, total] = await Promise.all([
      Rating.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("ratedBy", "firstName lastName profilePhoto")
        .populate("task", "title"),
      Rating.countDocuments(query),
    ]);

    const user = await User.findById(userId).select("averageRating totalRatings trustScore");

    return res.status(200).json({
      success: true,
      ratings,
      averageRating: user ? user.averageRating : 0,
      totalRatings: user ? user.totalRatings : 0,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRating,
  getUserRatings,
};
