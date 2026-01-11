const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    type: {
      type: String, // logic, finance, aptitude
      required: true,
    },
    difficulty: {
      type: String, // easy, medium, hard
      required: true,
    },
    duration: {
      type: Number, // in seconds
      required: true,
    },
    basePoints: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);
