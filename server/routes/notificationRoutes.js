const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.get("/", protect, notificationController.getNotifications);
router.patch("/read-all", protect, notificationController.markAllAsRead); // MUST map before /:id/read
router.patch("/:id/read", protect, notificationController.markAsRead);
router.delete("/:id", protect, notificationController.deleteNotification);

module.exports = router;
