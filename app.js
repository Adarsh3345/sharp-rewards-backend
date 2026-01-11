const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("./firebase");
const protectedRoutes = require("./routes/protectedRoutes");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/User");
const gameRoutes = require("./routes/gameRoutes");
const sharpStreaksRoutes = require("./routes/sharpStreaksRoutes");
const spinRoutes = require("./routes/spinRoutes");
require("dotenv").config();

const app = express();

app.use(cors());                 
app.use(express.json());
app.use("/api", protectedRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/streaks", sharpStreaksRoutes);
app.use("/api/spin", spinRoutes);
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

app.get("/api/token-test", require("./middleware/authMiddleware"), (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});