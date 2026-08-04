const Resume = require("../models/Resume");
const ToolResult = require("../models/ToolResult");

const getQuery = (req) => ({
  userId: req.user._id,
  toolType: req.params.toolType || req.body.toolType,
  resumeFingerprint: req.query.resumeFingerprint || req.body.resumeFingerprint,
  inputKey: req.query.inputKey || req.body.inputKey || "default",
});

exports.getToolResult = async (req, res) => {
  try {
    const query = getQuery(req);

    if (!query.toolType || !query.resumeFingerprint) {
      return res.status(400).json({ message: "toolType and resumeFingerprint are required" });
    }

    const toolResult = await ToolResult.findOne(query);
    res.json({ toolResult });
  } catch (error) {
    res.status(500).json({ message: "Failed to load tool result", error: error.message });
  }
};

exports.saveToolResult = async (req, res) => {
  try {
    const {
      toolType,
      resumeFingerprint,
      resumeFileName,
      inputKey = "default",
      input = {},
      result,
    } = req.body;

    if (!toolType || !resumeFingerprint || !result) {
      return res.status(400).json({ message: "toolType, resumeFingerprint, and result are required" });
    }

    const resume = await Resume.findOne({
      userId: req.user._id,
      fingerprint: resumeFingerprint,
    });

    const toolResult = await ToolResult.findOneAndUpdate(
      {
        userId: req.user._id,
        toolType,
        resumeFingerprint,
        inputKey,
      },
      {
        userId: req.user._id,
        resumeId: resume?._id || null,
        resumeFingerprint,
        resumeFileName: resumeFileName || resume?.fileName || "Active resume",
        toolType,
        inputKey,
        input,
        result,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.json({ toolResult });
  } catch (error) {
    res.status(500).json({ message: "Failed to save tool result", error: error.message });
  }
};

exports.deleteToolResult = async (req, res) => {
  try {
    const query = getQuery(req);

    if (!query.toolType || !query.resumeFingerprint) {
      return res.status(400).json({ message: "toolType and resumeFingerprint are required" });
    }

    await ToolResult.deleteOne(query);
    res.json({ message: "Tool result deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tool result", error: error.message });
  }
};

exports.getToolSummary = async (req, res) => {
  try {
    const { resumeFingerprint } = req.query;
    const query = { userId: req.user._id };

    if (resumeFingerprint) {
      query.resumeFingerprint = resumeFingerprint;
    }

    const results = await ToolResult.find(query).sort({ updatedAt: -1 });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: "Failed to load tool summary", error: error.message });
  }
};
