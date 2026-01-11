const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const { uid, email } = req.user;

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: "User not found in DB" });
    }

    return res.json({
      name: user.name || email.split("@")[0],
      email: user.email,
      coins: user.coins,
      xp: user.xp,
      streak: user.streak,
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

module.exports = router;
