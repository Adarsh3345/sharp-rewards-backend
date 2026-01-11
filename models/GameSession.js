const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    q: String,
    options: [String],
    answer: String,
  },
  { _id: false }
);

const gameSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
    },
    questions: [questionSchema],
    answers: [mongoose.Schema.Types.Mixed],
    score: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number, // 0 to 1
      default: 0,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameSession", gameSessionSchema);
