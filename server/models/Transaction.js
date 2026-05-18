const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "deposit",
        "withdrawal",
        "escrow_lock",
        "escrow_release",
        "escrow_refund",
        "task_payment",
      ],
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    reference: { type: String, default: "" },
    description: { type: String, default: "" },
    paystackReference: { type: String },
    paystackAccessCode: { type: String },
    bankDetails: {
      accountName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      bankName: { type: String, default: "" },
      bankCode: { type: String, default: "" },
      swiftCode: { type: String, default: "" },
    },
    taskRef: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    processedAt: { type: Date, default: null },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Indexes
transactionSchema.index({ user: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paystackReference: 1 }, { unique: true, sparse: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
