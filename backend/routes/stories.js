const express = require('express');
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer for story media
const storage = multer.diskStorage({
  destination: 'uploads/stories',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create story
router.post('/create', auth, upload.single('media'), async (req, res) => {
  try {
    const { content, mediaType } = req.body;
    const story = new Story({
      userId: req.userId,
      content,
      mediaType,
      mediaUrl: req.file ? `/uploads/stories/${req.file.filename}` : null
    });
    await story.save();
    await story.populate('userId', '-password');
    res.json(story);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get stories from following
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const stories = await Story.find({
      userId: { $in: user.following }
    })
    .populate('userId', '-password')
    .sort({ createdAt: -1 })
    .lean();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// View story
router.post('/:storyId/view', auth, async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.storyId,
      { $addToSet: { viewedBy: req.userId } },
      { new: true }
    );
    res.json(story);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
