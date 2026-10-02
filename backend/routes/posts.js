const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer for post media
const storage = multer.diskStorage({
  destination: 'uploads/posts',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Create post
router.post('/create', auth, upload.array('media', 5), async (req, res) => {
  try {
    const { content } = req.body;
    const media = req.files ? req.files.map(file => ({
      url: `/uploads/posts/${file.filename}`,
      type: file.mimetype.startsWith('image') ? 'image' : 'video'
    })) : [];

    const post = new Post({
      userId: req.userId,
      content,
      media
    });
    await post.save();
    await post.populate('userId', '-password');
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get feed
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const posts = await Post.find({
      userId: { $in: [...user.following, req.userId] }
    })
    .populate('userId', '-password')
    .sort({ createdAt: -1 })
    .limit(20);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get user posts
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate('userId', '-password')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Like post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $addToSet: { likes: req.userId } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Unlike post
router.post('/:postId/unlike', auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $pull: { likes: req.userId } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Add comment
router.post('/:postId/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $push: { comments: { userId: req.userId, content } } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
