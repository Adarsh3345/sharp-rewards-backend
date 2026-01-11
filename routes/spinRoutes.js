const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

/**
 * 🎡 Spin rewards pool (coins)
 */
const SPIN_REWARDS = [1, 2, 5, 10, 20];

/**
 * =========================
 * GET SPIN STATUS
 * =========================
 * GET /api/spin/status
 * Used to enable/disable spin button
 */
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date().toDateString();

    return res.json({
      canSpin: user.lastSpinDate !== today,
      lastSpinDate: user.lastSpinDate || null,
    });
  } catch (err) {
    console.error("Spin status error:", err);
    return res.status(500).json({ message: "Failed to get spin status" });
  }
});

/**
 * =========================
 * SPIN ACTION
 * =========================
 * POST /api/spin/spin
 */
router.post("/spin", authMiddleware, async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date().toDateString();

    // ❌ Already spun today
    if (user.lastSpinDate === today) {
      return res.status(400).json({
        message: "You have already used today’s spin 🎡",
      });
    }

    // 🎲 Random reward
    const reward =
      SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)];

    // 👤 Update user
    user.coins = (user.coins || 0) + reward;
    user.lastSpinDate = today;
    await user.save();

    // 💰 Update wallet
    await Wallet.findOneAndUpdate(
      { userId: user._id },
      {
        $inc: { balance: reward },
        $push: {
          transactions: {
            type: "SPIN_REWARD",
            amount: reward,
            date: new Date(),
          },
        },
        $setOnInsert: { transactions: [] },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "Spin successful 🎉",
      reward,
      totalCoins: user.coins,
    });
  } catch (err) {
    console.error("Spin error:", err);
    return res.status(500).json({ message: "Spin failed" });
  }
});

module.exports = router;
