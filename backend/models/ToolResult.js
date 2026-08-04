const mongoose = require("mongoose");

const toolResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    resumeFingerprint: {
      type: String,
      required: true,
      index: true,
    },
    resumeFileName: {
      type: String,
      default: "Active resume",
    },
    toolType: {
      type: String,
      required: true,
      enum: [
        "ats",
        "analyzer",
        "builder",
        "mockInterview",
        "aiInterview",
        "aptitude",
      ],
      index: true,
    },
    inputKey: {
      type: String,
      default: "default",
      index: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
);

toolResultSchema.index(
  { userId: 1, resumeFingerprint: 1, toolType: 1, inputKey: 1 },
  { unique: true },
);

module.exports = mongoose.model("ToolResult", toolResultSchema);
