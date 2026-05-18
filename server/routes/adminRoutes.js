const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/stats", protect, restrictTo("admin"), adminController.getDashboardStats);
router.get("/users", protect, restrictTo("admin"), adminController.getAllUsers);
router.get("/users/:id", protect, restrictTo("admin"), adminController.getUserDetails);
router.patch("/users/:id/ban", protect, restrictTo("admin"), adminController.banUser);
router.patch("/users/:id/unban", protect, restrictTo("admin"), adminController.unbanUser);
router.patch("/users/:id/suspend", protect, restrictTo("admin"), adminController.suspendUser);
router.patch("/users/:id/unsuspend", protect, restrictTo("admin"), adminController.unsuspendUser);
router.get("/revenue", protect, restrictTo("admin"), adminController.getRevenueReport);

module.exports = router;
