const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yap')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/posts', require('./routes/posts'));

// Socket.io Events
const users = {};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('user-online', (userId) => {
    users[userId] = socket.id;
    io.emit('user-status', { userId, status: 'online', users: Object.keys(users) });
  });

  socket.on('send-message', (data) => {
    const { to, message, from, timestamp } = data;
    const recipientSocketId = users[to];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive-message', {
        from,
        message,
        timestamp
      });
    }
  });

  socket.on('typing', (data) => {
    const recipientSocketId = users[data.to];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user-typing', { from: data.from });
    }
  });

  socket.on('stop-typing', (data) => {
    const recipientSocketId = users[data.to];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user-stop-typing', { from: data.from });
    }
  });

  socket.on('new-story', (data) => {
    io.emit('story-added', data);
  });

  socket.on('new-post', (data) => {
    io.emit('post-added', data);
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(users).find(key => users[key] === socket.id);
    if (userId) {
      delete users[userId];
      io.emit('user-status', { userId, status: 'offline', users: Object.keys(users) });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`YAP Server running on port ${PORT}`);
});
