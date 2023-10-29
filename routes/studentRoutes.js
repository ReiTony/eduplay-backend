const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/authentication");
const {
  studentLogin,
  studentLogout,
  showCurrentStudent,
} = require("../controllers/studentController");
const {
  recordAssessmentScore,
  recordModuleProgress,
  recordGameScore,
} = require("../controllers/recordController");

// Student
router.get("/:id", showCurrentStudent);
router.post("/login", studentLogin);
router.delete("/logout", authenticateUser, studentLogout);

// Record
router.post("/assessment/:assessmentId", recordAssessmentScore);
router.post("/module/:moduleId", recordModuleProgress);
router.post("/game-score", recordGameScore);

module.exports = router;
