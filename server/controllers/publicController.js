const User = require("../models/User");
const Task = require("../models/Task");

const getPublicStats = async (req, res, next) => {
  try {
    const [totalUsers, completedTasks, openTasks] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({ status: "open" }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        completedTasks,
        openTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStats,
};
