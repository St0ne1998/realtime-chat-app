import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { loginSuccess, logout } from './redux/authSlice';
import io from 'socket.io-client';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Stories from './pages/Stories';
import Posts from './pages/Posts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
let socket = null;

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      axios.get(`${API_URL}/api/auth/me`)
        .then(res => dispatch(loginSuccess({ user: res.data, token: storedToken })))
        .catch(() => dispatch(logout()));
    }
  }, [dispatch]);

  useEffect(() => {
    // Initialize Socket.io
    if (user && !socket) {
      socket = io(API_URL, {
        auth: { token }
      });
      socket.emit('user-online', user._id);
      window.socket = socket;
    }
  }, [user, token]);

  return (
    <Router>
      <div className="bg-dark min-h-screen">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/chat/:userId" element={user ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/profile/:userId" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/stories" element={user ? <Stories /> : <Navigate to="/login" />} />
          <Route path="/posts" element={user ? <Posts /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
