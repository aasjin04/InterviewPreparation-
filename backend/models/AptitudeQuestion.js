const mongoose = require("mongoose");

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    sourceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) => Array.isArray(options) && options.length >= 2,
        message: "At least two options are required",
      },
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      default: "aptii.pdf",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AptitudeQuestion", aptitudeQuestionSchema);
