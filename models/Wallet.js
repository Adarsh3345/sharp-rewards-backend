const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    amount: Number,
    type: {
      type: String, // credit / debit
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
