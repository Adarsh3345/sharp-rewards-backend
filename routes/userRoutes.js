const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

/**
 * Sync Firebase user → MongoDB
 * Called after register/login
 */
router.post("/register", authMiddleware, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    // Check if user already exists
    let user = await User.findOne({ uid });

    if (!user) {
      // Create new user
      user = await User.create({
        uid,
        email,
        name: name || "",
        coins: 0,
        xp: 0,
        streak: 0,
      });

      // Create wallet
      await Wallet.create({
        userId: user._id,
        balance: 0,
        transactions: [],
      });
    }

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save user" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
