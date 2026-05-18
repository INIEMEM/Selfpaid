const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/uploadMiddleware");

router.get("/me", protect, userController.getProfile);
router.patch("/me", protect, userController.updateProfile);
router.patch("/me/photo", protect, uploadSingle, userController.updateProfilePhoto);
router.delete("/me/photo", protect, userController.deleteProfilePhoto);
router.patch("/me/password", protect, userController.changePassword);
router.get("/:id", userController.getUserById);

module.exports = router;
