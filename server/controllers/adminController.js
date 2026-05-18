const User = require("../models/User");
const Task = require("../models/Task");
const PlatformRevenue = require("../models/PlatformRevenue");
const Withdrawal = require("../models/Withdrawal");
const Transaction = require("../models/Transaction");
const { sendEmail } = require("../utils/sendEmail"); // User specified util

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalUsers,
      totalWorkers,
      totalCreators,
      totalTasks,
      pendingApproval,
      openTasks,
      inProgressTasks,
      completedTasks,
      disputedTasks,
      allRevenue,
      pendingWithdrawals,
      paidWithdrawals,
      newUsersThisMonth,
      newTasksThisMonth,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "worker" }),
      User.countDocuments({ role: "creator" }),
      Task.countDocuments(),
      Task.countDocuments({ status: "pending_approval" }),
      Task.countDocuments({ status: "open" }),
      Task.countDocuments({ status: "in_progress" }),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({ status: "disputed" }),
      PlatformRevenue.find(),
      Withdrawal.countDocuments({ status: "pending" }),
      Withdrawal.countDocuments({ status: "paid" }),
      User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Task.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
    ]);

    const totalRevenue = allRevenue.reduce((sum, rev) => sum + rev.amount, 0);
    const commissionRevenue = allRevenue
      .filter((rev) => rev.type === "task_commission")
      .reduce((sum, rev) => sum + rev.amount, 0);
    const withdrawalFeeRevenue = allRevenue
      .filter((rev) => rev.type === "withdrawal_fee")
      .reduce((sum, rev) => sum + rev.amount, 0);

    return res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, workers: totalWorkers, creators: totalCreators, newThisMonth: newUsersThisMonth },
        tasks: { total: totalTasks, pending: pendingApproval, open: openTasks, inProgress: inProgressTasks, completed: completedTasks, disputed: disputedTasks, newThisMonth: newTasksThisMonth },
        revenue: { total: totalRevenue, commission: commissionRevenue, withdrawalFees: withdrawalFeeRevenue },
        withdrawals: { pending: pendingWithdrawals, paid: paidWithdrawals },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, isBanned, search, page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === "true";
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select("-password -refreshTokens").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      users,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password -refreshTokens");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const [recentTransactions, createdTasks, completedTasksCount] = await Promise.all([
      Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).populate("taskRef", "title"),
      user.role === "creator" ? Task.countDocuments({ creator: user._id }) : 0,
      user.role === "worker" ? Task.countDocuments({ worker: user._id, status: "completed" }) : 0,
    ]);

    return res.status(200).json({
      success: true,
      user,
      recentTransactions,
      taskStats: { createdTasks, completedTasksCount },
      ratingStats: { totalRatings: user.totalRatings, averageRating: user.averageRating },
    });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: "Ban reason is required" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ success: false, message: "Cannot ban admin accounts" });

    user.isBanned = true;
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: "Your Account Has Been Banned",
        message: `Your account on Global Task Platform has been banned. Reason: ${reason}`
      });
    } catch(err) {
      console.log("Ban email warning:", err.message);
    }

    return res.status(200).json({ success: true, message: "User banned successfully" });
  } catch (error) {
    next(error);
  }
};

const unbanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isBanned = false;
    await user.save();

    return res.status(200).json({ success: true, message: "User unbanned successfully" });
  } catch (error) {
    next(error);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: "Suspension reason is required" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ success: false, message: "Cannot suspend admin accounts" });

    user.isSuspended = true;
    await user.save();

    return res.status(200).json({ success: true, message: "User suspended successfully" });
  } catch (error) {
    next(error);
  }
};

const unsuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isSuspended = false;
    await user.save();

    return res.status(200).json({ success: true, message: "User unsuspended" });
  } catch (error) {
    next(error);
  }
};

const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (type) query.type = type;

    const revenueRecords = await PlatformRevenue.find(query).sort({ createdAt: 1 });

    let totalRevenue = 0;
    const revenueByType = { task_commission: 0, withdrawal_fee: 0 };
    const revenueByDayMap = {};

    revenueRecords.forEach((record) => {
      totalRevenue += record.amount;
      revenueByType[record.type] += record.amount;

      const dateKey = record.createdAt.toISOString().split("T")[0];
      revenueByDayMap[dateKey] = (revenueByDayMap[dateKey] || 0) + record.amount;
    });

    const revenueByDay = Object.keys(revenueByDayMap).map((date) => ({
      date,
      amount: revenueByDayMap[date],
    }));

    return res.status(200).json({
      success: true,
      report: { totalRevenue, revenueByType, revenueByDay },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  getRevenueReport,
};
