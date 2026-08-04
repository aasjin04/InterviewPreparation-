const AptitudeQuestion = require("../models/AptitudeQuestion");

const shuffleOptions = (question) => ({
  ...question,
  options: [...question.options].sort(() => Math.random() - 0.5),
});

exports.getRandomAptitudeQuestions = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 15, 1), 40);

    const questions = await AptitudeQuestion.aggregate([
      { $sample: { size: limit } },
      {
        $project: {
          sourceId: 1,
          category: 1,
          question: 1,
          options: 1,
          answer: 1,
          explanation: 1,
        },
      },
    ]);

    res.json({
      questions: questions.map((question) =>
        shuffleOptions({
          id: question.sourceId,
          category: question.category,
          question: question.question,
          options: question.options,
          answer: question.answer,
          explanation: question.explanation,
        }),
      ),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load aptitude questions",
      error: error.message,
    });
  }
};
