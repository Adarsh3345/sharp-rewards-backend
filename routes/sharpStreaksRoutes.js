const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/sharpStreaksController");

router.post("/start", authMiddleware, controller.startGame);
router.post("/submit", authMiddleware, controller.submitGame);

module.exports = router;
