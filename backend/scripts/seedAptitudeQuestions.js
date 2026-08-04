const dotenv = require("dotenv");
const connectDB = require("../config/db");
const AptitudeQuestion = require("../models/AptitudeQuestion");
const aptitudeQuestions = require("../data/aptitudeQuestions");

dotenv.config();

const seedAptitudeQuestions = async () => {
  try {
    await connectDB();

    const operations = aptitudeQuestions.map((question) => ({
      updateOne: {
        filter: { sourceId: question.sourceId },
        update: { $set: question },
        upsert: true,
      },
    }));

    const result = await AptitudeQuestion.bulkWrite(operations);

    console.log(
      `Aptitude questions seeded: ${aptitudeQuestions.length}. Inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}.`,
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed aptitude questions:", error.message);
    process.exit(1);
  }
};

seedAptitudeQuestions();
