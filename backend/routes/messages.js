const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer for media files
const storage = multer.diskStorage({
  destination: 'uploads/messages',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get conversation
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.userId, to: req.params.userId },
        { from: req.params.userId, to: req.userId }
      ]
    }).sort({ createdAt: 1 }).populate('from to', '-password');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Send text message
router.post('/send', auth, async (req, res) => {
  try {
    const { to, content } = req.body;
    const message = new Message({
      from: req.userId,
      to,
      content,
      messageType: 'text'
    });
    await message.save();
    await message.populate('from to', '-password');
    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Upload media message
router.post('/send-media', auth, upload.single('media'), async (req, res) => {
  try {
    const { to, messageType } = req.body;
    const message = new Message({
      from: req.userId,
      to,
      messageType,
      mediaUrl: `/uploads/messages/${req.file.filename}`
    });
    await message.save();
    await message.populate('from to', '-password');
    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Mark as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.messageId, { isRead: true }, { new: true });
    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get conversations list
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ from: req.userId }, { to: req.userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$from', req.userId] },
              '$to',
              '$from'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
