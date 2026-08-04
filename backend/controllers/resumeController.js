const Resume = require("../models/Resume");
const User = require("../models/User");

exports.getActiveResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("activeResume");

    if (!user?.activeResume) {
      return res.json({ resume: null });
    }

    res.json({ resume: user.activeResume });
  } catch (error) {
    res.status(500).json({ message: "Failed to load active resume", error: error.message });
  }
};

exports.saveActiveResume = async (req, res) => {
  try {
    const { fileName, text, uploadedAt, fingerprint } = req.body;

    if (!fileName || !text || !fingerprint) {
      return res.status(400).json({ message: "Resume fileName, text, and fingerprint are required" });
    }

    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id, fingerprint },
      {
        userId: req.user._id,
        fileName,
        text,
        fingerprint,
        uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date(),
        isActive: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await Resume.updateMany(
      { userId: req.user._id, _id: { $ne: resume._id } },
      { isActive: false },
    );

    await User.findByIdAndUpdate(req.user._id, { activeResume: resume._id });

    res.json({ resume });
  } catch (error) {
    res.status(500).json({ message: "Failed to save active resume", error: error.message });
  }
};

exports.clearActiveResume = async (req, res) => {
  try {
    await Resume.updateMany({ userId: req.user._id }, { isActive: false });
    await User.findByIdAndUpdate(req.user._id, { activeResume: null });

    res.json({ message: "Active resume cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear active resume", error: error.message });
  }
};
