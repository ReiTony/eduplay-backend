const Student = require("../models/studentSchema");
const Notification = require("../models/notificationSchema");
const AssessmentRecord = require("../models/assessmentRecordsSchema");
const { getModuleSync } = require("./moduleController");

const createAssessmentRecord = async (req, res) => {
  try {
    const { moduleNumber, userId, answers } = req.body;
    if (!moduleNumber || !userId || !answers)
      return res
        .status(400)
        .json({ message: " moduleNumber, userId, and answers, are required." });
    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (
      (
        await AssessmentRecord.find({
          studentId: userId,
          gradeLevel: student.gradeLevel,
          moduleNumber,
        })
      ).length > 0
    )
      return res
        .status(400)
        .json({ message: "You have already taken this assessment!" });

    const module = getModuleSync(
      moduleNumber,
      student.gradeLevel,
      "assessment"
    );
    if (module.questions.length !== answers.length)
      return res
        .status(400)
        .json({
          message: `The number of questions (${module.questions.length}) and answer (${answers.length}) does not match.`,
        });

    let categories = new Array(module.categories.length).fill(0);
    const score = module.questions.reduce((totalScore, question, index) => {
      if (question.correctAnswer === answers[index]) return totalScore + 1;
      else categories[question.category]++;
      return totalScore;
    }, 0);
    let recommendation = "";
    if (Math.max(categories) === 0)
      recommendation = `You scored ${score}/${score} on the '${module.title}' assessment! Keep up the good work!`;
    else
      recommendation = `You scored ${score}/${
        module.questions.length
      } on the '${
        module.title
      }' Consider studying more about ${getMaxWrongAnswers(
        categories,
        module.categories
      )} to help boost your score!`;

    const newAssessmentRecord = new AssessmentRecord({
      studentId: userId,
      score: score,
      moduleNumber,
      gradeLevel: student.gradeLevel,
      answers,
      total: module.questions.length,
    });
    await newAssessmentRecord.save();

    // Create notification
    const notificationMessage = `You scored ${score}/${module.questions.length} in "${module.title}"`;
    const notification = new Notification({
      message: notificationMessage,
      gradeLevel: student.gradeLevel,
      recipient: userId,
    });
    await notification.save();

    res
      .status(200)
      .json({
        message: "Success",
        score,
        recommendation,
        total: module.questions.length,
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getMaxWrongAnswers = (arr, categories) => {
  let max = Math.max(...arr);
  let maxIndices = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === max) maxIndices.push(categories[i]);
  }
  return maxIndices.join(", ");
};

module.exports = { createAssessmentRecord };
