# YAP - Real-Time Social Messaging Platform

## Overview
YAP is a modern, full-featured real-time social messaging and content sharing platform built with React, Node.js, Socket.io, and MongoDB.

## Features
✨ **Real-Time Messaging** - Instant user-to-user private chats
🎭 **Stories** - Share ephemeral stories visible to followers
📸 **Profile Pictures** - Upload and customize profile avatars
🎬 **Media Sharing** - Post text, images, and videos
🎤 **Voice Notes** - Record and send voice messages
👥 **Follow System** - Build your network and see follower content
🟢 **Online Status** - See who's currently online
🎨 **Dark Theme** - Professional black & white design

## Tech Stack
- **Frontend**: React, Redux, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **Storage**: Multer for file uploads
- **Authentication**: JWT

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/St0ne1998/realtime-chat-app.git
cd realtime-chat-app
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` files

**Backend `.env`:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yap
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

**Frontend `.env`:**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the development server
```bash
npm run dev
```

## Project Structure
```
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## License
MIT
