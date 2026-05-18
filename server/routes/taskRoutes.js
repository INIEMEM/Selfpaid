const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect, restrictTo } = require("../middleware/auth");
const { uploadTaskFile } = require("../middleware/uploadMiddleware");
const requireEmailVerified = require("../middleware/requireEmailVerified");

// ─── Static routes FIRST (before /:id to avoid route conflicts) ───────────────

// Worker
router.get("/worker/my-tasks", protect, restrictTo("worker"), taskController.getWorkerTasks);

// Creator
router.get("/creator/my-tasks", protect, restrictTo("creator"), taskController.getCreatorTasks);

// Admin
router.get("/admin/pending", protect, restrictTo("admin"), taskController.adminGetPendingTasks);
router.get("/admin/disputed", protect, restrictTo("admin"), taskController.adminGetDisputedTasks);
router.patch("/admin/:id/review", protect, restrictTo("admin"), taskController.adminReviewTask);
router.patch("/admin/:id/resolve", protect, restrictTo("admin"), taskController.adminResolveDispute);

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/", taskController.browseTasks);
router.get("/:id", taskController.getTaskById);

// ─── Worker routes ────────────────────────────────────────────────────────────
router.post("/:id/apply", protect, restrictTo("worker"), taskController.applyForTask);
router.post("/:id/submit", protect, restrictTo("worker"), uploadTaskFile, taskController.submitTaskWork);
router.post("/:id/dispute", protect, taskController.raiseDispute);

// ─── Creator routes ───────────────────────────────────────────────────────────
router.post("/", protect, restrictTo("creator"), requireEmailVerified, taskController.createTask);
router.patch("/:id", protect, restrictTo("creator"), taskController.updateTask);
router.delete("/:id/cancel", protect, restrictTo("creator"), taskController.cancelTask);
router.patch("/:id/select-worker", protect, restrictTo("creator"), taskController.selectWorker);
router.patch("/:id/review", protect, restrictTo("creator"), taskController.reviewSubmission);

module.exports = router;
