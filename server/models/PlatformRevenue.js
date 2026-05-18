const mongoose = require("mongoose");

const platformRevenueSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["task_commission", "withdrawal_fee"],
      required: true,
    },
    amount: { type: Number, required: true },
    taskRef: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    workerRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    creatorRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    withdrawalRef: { type: mongoose.Schema.Types.ObjectId, ref: "Withdrawal", default: null },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformRevenue", platformRevenueSchema);
