const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("./firebase");
require("dotenv").config();

const app = express();

app.use(cors());                 
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err);
  });


app.get("/", (req, res) => {
  res.send("Sharp Rewards Backend is Running 🚀");
});

app.get("/firebase-test", async (req, res) => {
  res.send("Firebase Admin Connected ✅");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});