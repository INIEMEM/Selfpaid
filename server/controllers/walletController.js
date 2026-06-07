const crypto = require("crypto");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Withdrawal = require("../models/Withdrawal");
const paystackClient = require("../config/paystack");

// ═══════════════════════════════════════════════════════════════════════════════
// WALLET
// ═══════════════════════════════════════════════════════════════════════════════

const getWalletBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("walletBalance escrowBalance tokenBalance firstName lastName");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      wallet: {
        available: user.walletBalance,
        inEscrow: user.escrowBalance,
        tokenBalance: user.tokenBalance || 0,
        total: user.walletBalance + user.escrowBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionHistory = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    // This is to count the page number and limit the number of transactions per page
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { user: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("taskRef", "title reward"),
      Transaction.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAYSTACK DEPOSITS
// ═══════════════════════════════════════════════════════════════════════════════

const createDepositIntent = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) < 5 || Number(amount) > 10000) {
      return res.status(400).json({ success: false, message: "Amount must be between $5 and $10,000" });
    }

    const amountInKobo = Math.round(Number(amount) * 100);

    const response = await paystackClient.initializeTransaction({
      amount: amountInKobo,
      email: req.user.email,
      metadata: JSON.stringify({
        userId: req.user.id.toString(),
        userEmail: req.user.email,
      }),
    });

    const body = response.body || response;

    if (!body.data || !body.data.reference) {
      return res.status(500).json({ success: false, message: "Failed to initialize payment. Please try again." });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type: "deposit",
      amount: Number(amount),
      status: "pending",
      paystackReference: body.data.reference,
      paystackAccessCode: body.data.access_code,
      description: `Wallet deposit of $${amount}`,
    });

    return res.status(200).json({
      success: true,
      authorizationUrl: body.data.authorization_url,
      accessCode: body.data.access_code,
      reference: body.data.reference,
      transactionId: transaction._id,
      amount: Number(amount),
    });
  } catch (error) {
    next(error);
  }
};

const handlePaystackWebhook = async (req, res, next) => {
  try {
    // Verify HMAC signature
    const signature = req.headers["x-paystack-signature"];
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (hash !== signature) {
      return res.status(400).json({ success: false, message: "Webhook signature verification failed" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "charge.success") {
      const { reference, metadata, amount } = event.data;
      const amountInDollars = amount / 100;
      const userId = metadata?.userId;

      const transaction = await Transaction.findOne({ paystackReference: reference });
      if (!transaction) {
        console.error(`Webhook: Transaction not found for reference ${reference}`);
        return res.status(200).json({ received: true });
      }

      // Idempotency — already processed
      if (transaction.status === "completed") {
        return res.status(200).json({ received: true });
      }

      transaction.status = "completed";
      transaction.processedAt = new Date();

      const user = await User.findById(userId);
      if (user) {
        user.walletBalance += amountInDollars;
        await user.save();
      }

      await transaction.save();
      console.log(`Webhook: Deposit of $${amountInDollars} credited to user ${userId}`);
    }

    if (event.event === "charge.failed") {
      const { reference } = event.data;
      const transaction = await Transaction.findOne({ paystackReference: reference });
      if (transaction) {
        transaction.status = "failed";
        await transaction.save();
        console.log(`Webhook: Charge failed for reference ${reference}`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// WITHDRAWALS
// ═══════════════════════════════════════════════════════════════════════════════

const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, accountName, accountNumber, bankName, bankCode, swiftCode } = req.body;

    if (!amount || isNaN(amount) || Number(amount) < 5) {
      return res.status(400).json({ success: false, message: "Withdrawal amount must be at least $5" });
    }
    if (!accountName || !accountNumber || !bankName) {
      return res.status(400).json({ success: false, message: "Account name, account number, and bank name are required" });
    }

    const user = await User.findById(req.user.id);
    if (user.walletBalance < Number(amount)) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
    }

    // Check for existing pending/processing withdrawal
    const existingPending = await Withdrawal.findOne({
      user: req.user.id,
      status: { $in: ["pending", "processing"] },
    });
    if (existingPending) {
      return res.status(400).json({ success: false, message: "You already have a pending withdrawal request" });
    }

    user.walletBalance -= Number(amount);

    const withdrawalFee = parseFloat(process.env.WITHDRAWAL_FEE) || 1;
    if (amount <= withdrawalFee) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is $${withdrawalFee + 1} after fees`
      });
    }
    const amountAfterFee = parseFloat((amount - withdrawalFee).toFixed(2));

    const withdrawal = new Withdrawal({
      user: req.user.id,
      amount: amountAfterFee, // Actual payout to user
      requestedAmount: amount,
      amountAfterFee: amountAfterFee,
      fee: withdrawalFee,
      status: "pending",
      bankDetails: {
        accountName,
        accountNumber,
        bankName,
        bankCode: bankCode || "",
        swiftCode: swiftCode || "",
      },
    });

    const transaction = await Transaction.create({
      user: req.user.id,
      type: "withdrawal",
      amount: Number(amount),
      status: "pending",
      description: `Withdrawal request of $${amount} to ${bankName}`,
    });

    withdrawal.transactionRef = transaction._id;

    await Promise.all([user.save(), withdrawal.save()]);

    const PlatformRevenue = require("../models/PlatformRevenue");
    await PlatformRevenue.create({
      type: "withdrawal_fee",
      amount: withdrawalFee,
      workerRef: req.user.id,
      withdrawalRef: withdrawal._id,
      description: `Withdrawal fee for $${amount} withdrawal`,
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted. Processing within 2-3 business days.",
      withdrawal,
    });
  } catch (error) {
    next(error);
  }
};

const getMyWithdrawals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { user: req.user.id };
    if (status) query.status = status;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Withdrawal.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      withdrawals,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

const cancelWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findOne({ _id: req.params.id, user: req.user.id });
    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal not found" });

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending withdrawals can be cancelled" });
    }

    const user = await User.findById(req.user.id);
    user.walletBalance += withdrawal.amount;

    withdrawal.status = "cancelled";

    if (withdrawal.transactionRef) {
      await Transaction.findByIdAndUpdate(withdrawal.transactionRef, { status: "cancelled" });
    }

    await Promise.all([user.save(), withdrawal.save()]);

    return res.status(200).json({
      success: true,
      message: "Withdrawal cancelled and funds returned to wallet",
      refundedAmount: withdrawal.amount,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN WITHDRAWAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

const adminGetWithdrawals = async (req, res, next) => {
  try {
    const { status = "pending", page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { status };

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate("user", "firstName lastName email profilePhoto"),
      Withdrawal.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      withdrawals,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

const adminProcessWithdrawal = async (req, res, next) => {
  try {
    const { action, adminNote } = req.body;

    const withdrawal = await Withdrawal.findOne({
      _id: req.params.id,
      status: { $in: ["pending", "processing"] },
    }).populate("user");

    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal not found" });

    if (action === "approve") {
      withdrawal.status = "paid";
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = req.user.id;
      if (adminNote) withdrawal.adminNote = adminNote;

      if (withdrawal.transactionRef) {
        await Transaction.findByIdAndUpdate(withdrawal.transactionRef, {
          status: "completed",
          processedAt: new Date(),
        });
      }

      await withdrawal.save();

      return res.status(200).json({ success: true, message: "Withdrawal marked as paid" });
    }

    if (action === "reject") {
      if (!adminNote) {
        return res.status(400).json({ success: false, message: "Admin note is required when rejecting a withdrawal" });
      }

      withdrawal.status = "rejected";
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = req.user.id;
      withdrawal.adminNote = adminNote;

      // Refund to user wallet
      const user = await User.findById(withdrawal.user._id);
      user.walletBalance += withdrawal.amount;
      await user.save();

      if (withdrawal.transactionRef) {
        await Transaction.findByIdAndUpdate(withdrawal.transactionRef, { status: "cancelled" });
      }

      await withdrawal.save();

      return res.status(200).json({
        success: true,
        message: "Withdrawal rejected and funds refunded to user wallet",
      });
    }

    return res.status(400).json({ success: false, message: "Invalid action" });
  } catch (error) {
    next(error);
  }
};

const verifyDeposit = async (req, res, next) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ success: false, message: "Reference is required" });
    }

    const transaction = await Transaction.findOne({ paystackReference: reference });
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Idempotency — already credited
    if (transaction.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "Transaction already verified and wallet credited",
        alreadyCredited: true,
      });
    }

    // Call Paystack verify API
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );
    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      transaction.status = "failed";
      await transaction.save();
      return res.status(400).json({
        success: false,
        message: "Payment was not successful",
        paystackStatus: data.data?.status,
      });
    }

    // Security: verify amount matches what was stored
    const amountPaidInDollars = data.data.amount / 100;
    if (amountPaidInDollars !== transaction.amount) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch. Please contact support.",
      });
    }

    const user = await User.findById(req.user.id);
    user.walletBalance += amountPaidInDollars;

    transaction.status = "completed";
    transaction.processedAt = new Date();

    await Promise.all([user.save(), transaction.save()]);

    return res.status(200).json({
      success: true,
      message: `Wallet credited with $${amountPaidInDollars}`,
      newBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

const enterRaffle = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const currentTokens = user.tokenBalance || 0;
    if (currentTokens < 50) {
      return res.status(400).json({ success: false, message: "Insufficient SPX tokens." });
    }

    user.tokenBalance -= 50;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Successfully entered the weekly SPX raffle!",
      tokensLeft: user.tokenBalance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWalletBalance,
  getTransactionHistory,
  createDepositIntent,
  handlePaystackWebhook,
  verifyDeposit,
  requestWithdrawal,
  getMyWithdrawals,
  cancelWithdrawal,
  adminGetWithdrawals,
  adminProcessWithdrawal,
  enterRaffle,
};
