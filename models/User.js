const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true, // Firebase UID
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    coins: {
      type: Number,
      default: 0,
    },
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },lastSpinDate: {
  type: String,
  default: null,
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
