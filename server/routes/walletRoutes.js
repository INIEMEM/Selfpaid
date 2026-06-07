const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { protect, restrictTo } = require("../middleware/auth");
const requireEmailVerified = require("../middleware/requireEmailVerified");

router.get("/balance", protect, walletController.getWalletBalance);
router.get("/transactions", protect, walletController.getTransactionHistory);
router.post("/raffle", protect, walletController.enterRaffle);
router.post("/deposit/intent", protect, walletController.createDepositIntent);
router.get("/deposit/verify/:reference", protect, walletController.verifyDeposit);
router.post("/deposit/webhook", walletController.handlePaystackWebhook);

// Email must be verified to withdraw
router.post("/withdraw", protect, requireEmailVerified, walletController.requestWithdrawal);
router.get("/withdraw", protect, walletController.getMyWithdrawals);
router.delete("/withdraw/:id", protect, walletController.cancelWithdrawal);

router.get("/admin/withdrawals", protect, restrictTo("admin"), walletController.adminGetWithdrawals);
router.patch("/admin/withdrawals/:id", protect, restrictTo("admin"), walletController.adminProcessWithdrawal);

module.exports = router;

