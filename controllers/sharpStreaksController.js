const mongoose = require("mongoose");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const GameSession = require("../models/GameSession");
const { generateQuestions } = require("../services/geminiService");

/**
 * =========================
 * START SHARP STREAKS GAME
 * =========================
 * POST /api/streaks/start
 */
exports.startGame = async (req, res) => {
  console.log("🔥 startGame controller entered");

  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { uid } = req.user;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const questions = await generateQuestions();

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ message: "Failed to generate questions" });
    }

    const session = await GameSession.create({
      userId: user._id,
      questions,
      completed: false,
    });

    return res.status(200).json({
      message: "Sharp Streaks game started 🎮",
      sessionId: session._id,
      questions: questions.map(q => ({
        q: q.q,
        options: q.options,
      })),
    });
  } catch (err) {
    console.error("💥 Start game error:", err);
    return res.status(500).json({ message: "Failed to start game" });
  }
};

/**
 * =========================
 * SUBMIT SHARP STREAKS GAME
 * =========================
 * POST /api/streaks/submit
 */
exports.submitGame = async (req, res) => {
  console.log("📨 submitGame called");
  console.log("📦 Body:", req.body);

  try {
    const { sessionId, answers, timeTaken } = req.body;

    // ✅ HARD VALIDATION
    if (
      !sessionId ||
      !mongoose.Types.ObjectId.isValid(sessionId) ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({
        message: "Invalid submission data",
      });
    }

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.completed) {
      return res.status(400).json({ message: "Game already submitted" });
    }

    const questions = Array.isArray(session.questions)
      ? session.questions
      : [];

    const total = Math.min(questions.length, answers.length);
    if (total === 0) {
      return res.status(400).json({ message: "No answers submitted" });
    }

    // ✅ SAFE ANSWER CHECK (Gemini compatible)
    let correct = 0;
    for (let i = 0; i < total; i++) {
      const correctAnswer =
        questions[i]?.answer ||
        questions[i]?.correct ||
        questions[i]?.correctAnswer;

      if (correctAnswer && answers[i] === correctAnswer) {
        correct++;
      }
    }

    const accuracy = correct / total;
    const basePoints = 10;
    const streakMultiplier = accuracy >= 0.8 ? 1.5 : 1;
    const score = Math.round(correct * basePoints * streakMultiplier);

    // 📝 Update session
    session.answers = answers;
    session.accuracy = accuracy;
    session.score = score;
    session.timeTaken = Number(timeTaken) || 0;
    session.completed = true;
    session.completedAt = new Date();
    await session.save();

    // 👤 Update user
    const user = await User.findById(session.userId);
    if (user) {
      user.streak = accuracy >= 0.8 ? (user.streak || 0) + 1 : 0;
      user.coins = (user.coins || 0) + score;
      user.xp = (user.xp || 0) + score;
      await user.save();

      // 💰 Wallet update (FIXED)
      await Wallet.findOneAndUpdate(
        { userId: user._id },
        {
          $inc: { balance: score },
          $push: {
            transactions: {
              type: "GAME_REWARD",
              amount: score,
              date: new Date(),
            },
          },
        },
        { upsert: true }
      );
    }

    return res.status(200).json({
      message: "Game completed ✅",
      score,
      accuracy,
      correct,
      total,
      streak: user?.streak || 0,
      coins: user?.coins || 0,
    });
  } catch (err) {
    console.error("💥 Submit game error:", err);
    return res.status(500).json({ message: "Failed to submit game" });
  }
};
