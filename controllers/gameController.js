const GameSession = require("../models/GameSession");
const Game = require("../models/Game");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const { calculateReward } = require("../services/gameEngine");
const { getQuestionsFromGemini } = require("../services/geminiService");

exports.startGame = async (req, res) => {
  const { gameId } = req.body;

  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ error: "Game not found" });

  const questions = await getQuestionsFromGemini({
    type: game.type,
    difficulty: game.difficulty,
  });

  res.json({ game, questions });
};

exports.submitGame = async (req, res) => {
  const { gameId, answers, timeTaken } = req.body;
  const userId = req.user.uid;

  const user = await User.findOne({ uid: userId });
  const game = await Game.findById(gameId);

  let correct = 0;
  answers.forEach((a) => {
    if (a.isCorrect) correct++;
  });

  const accuracy = correct / answers.length;

  const reward = calculateReward({
    basePoints: game.basePoints,
    accuracy,
    timeTaken,
    maxTime: game.duration,
    streak: user.streak,
  });

  await GameSession.create({
    userId: user._id,
    gameId,
    score: reward,
    accuracy,
    timeTaken,
  });

  // Update wallet
  const wallet = await Wallet.findOne({ userId: user._id });
  wallet.balance += reward;
  wallet.transactions.push({
    amount: reward,
    type: "credit",
    reason: "Game Reward",
  });
  await wallet.save();

  // Update user
  user.xp += reward;
  user.streak += 1;
  await user.save();

  res.json({ reward, accuracy });
};
