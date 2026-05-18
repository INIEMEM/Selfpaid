const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "task_approved",
        "task_rejected",
        "task_completed",
        "new_applicant",
        "worker_selected",
        "submission_received",
        "submission_approved",
        "submission_rejected",
        "payment_received",
        "withdrawal_approved",
        "withdrawal_rejected",
        "dispute_raised",
        "dispute_resolved",
        "general",
      ],
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    taskRef: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
