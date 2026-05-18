const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },
    reward: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
      enum: ["social", "writing", "marketing", "tech", "data", "design", "research", "other"],
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending_approval",
        "open",
        "in_progress",
        "submitted",
        "completed",
        "disputed",
        "cancelled",
      ],
      default: "pending_approval",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxApplicants: { type: Number, default: 10 },

    submission: {
      text: { type: String, default: "" },
      fileUrl: { type: String, default: "" },
      fileName: { type: String, default: "" },
      submittedAt: { type: Date, default: null },
    },

    rejectionReason: { type: String, default: "" },
    cancellationReason: { type: String, default: "" },
    disputeReason: { type: String, default: "" },

    adminNote: { type: String, default: "" },
    approvedByAdmin: { type: Boolean, default: false },
    approvedAt: { type: Date, default: null },

    escrowReleased: { type: Boolean, default: false },
    fundsRefunded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
taskSchema.index({ status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ creator: 1 });
taskSchema.index({ worker: 1 });

// Plugin
taskSchema.plugin(mongoosePaginate);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
