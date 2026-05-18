const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 5 },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "rejected", "cancelled"],
      default: "pending",
    },
    bankDetails: {
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true },
      bankCode: { type: String, default: "" },
      swiftCode: { type: String, default: "" },
    },
    adminNote: { type: String, default: "" },
    processedAt: { type: Date, default: null },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    transactionRef: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null },
    requestedAmount: { type: Number, default: 0 },
    amountAfterFee: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
withdrawalSchema.index({ user: 1 });
withdrawalSchema.index({ status: 1 });

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

module.exports = Withdrawal;
