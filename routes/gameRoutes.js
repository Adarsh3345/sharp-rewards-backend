const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const gameController = require("../controllers/gameController");

router.post("/streaks/start", authMiddleware, gameController.startGame);

module.exports = router;
