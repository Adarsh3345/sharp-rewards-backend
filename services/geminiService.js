const axios = require("axios");

const GEMINI_API_KEY = "AIzaSyD_yVhrTtOyfdzJEp0Szujxu5riAYlPAh8";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
async function generateQuestions() {
  try {
    const prompt = `
Create EXACTLY 5 multiple-choice quiz questions.

Rules:
- Difficulty: Easy to Medium
- Each question has 4 options
- One correct answer only
- No explanations
- No markdown
- Return ONLY JSON

Format:
[
  {
    "q": "Question text",
    "options": ["A","B","C","D"],
    "answer": "B"
  }
]
`;

    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const rawText =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Empty Gemini response");
    }

    // 🔍 Extract JSON safely
    const start = rawText.indexOf("[");
    const end = rawText.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("Invalid JSON from Gemini");
    }

    const questions = JSON.parse(rawText.slice(start, end + 1));

    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error("Invalid question count");
    }

    console.log("🤖 Gemini questions generated");
    return questions;
  } catch (err) {
    console.error("❌ Gemini generation failed:", err.message);

    // 🔁 FALLBACK QUESTIONS (VERY IMPORTANT)
    return [
      {
        q: "2 + 2 = ?",
        options: ["1", "2", "3", "4"],
        answer: "4",
      },
      {
        q: "Capital of India?",
        options: ["Delhi", "Mumbai", "Kolkata", "Chennai"],
        answer: "Delhi",
      },
      {
        q: "5 × 6 = ?",
        options: ["11", "30", "35", "25"],
        answer: "30",
      },
      {
        q: "10 / 2 = ?",
        options: ["2", "3", "5", "10"],
        answer: "5",
      },
      {
        q: "Square root of 16?",
        options: ["2", "3", "4", "5"],
        answer: "4",
      },
    ];
  }
}

module.exports = { generateQuestions };
