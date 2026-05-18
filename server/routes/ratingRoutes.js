const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { protect } = require("../middleware/auth");

router.post("/tasks/:taskId", protect, ratingController.submitRating);
router.get("/users/:userId", ratingController.getUserRatings);

module.exports = router;
