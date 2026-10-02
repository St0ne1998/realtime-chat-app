const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: 'uploads/profiles',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers following');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update profile
router.put('/update', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    let updateData = { firstName, lastName, bio };

    if (req.file) {
      updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Follow user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.userId);

    if (!currentUser.following.includes(req.params.userId)) {
      currentUser.following.push(req.params.userId);
      userToFollow.followers.push(req.userId);
      await currentUser.save();
      await userToFollow.save();
    }

    res.json({ msg: 'User followed' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Unfollow user
router.post('/:userId/unfollow', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.userId);

    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.userId);
    await currentUser.save();
    await userToUnfollow.save();

    res.json({ msg: 'User unfollowed' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { username: new RegExp(req.params.query, 'i') },
        { firstName: new RegExp(req.params.query, 'i') },
        { lastName: new RegExp(req.params.query, 'i') }
      ]
    }).select('-password').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
