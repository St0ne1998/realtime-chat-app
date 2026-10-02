import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FaPaperPlane, FaMicrophone, FaImage } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Chat() {
  const { userId } = useParams();
  const { user, token } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = window.socket;

  useEffect(() => {
    fetchMessages();
    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (data) => {
        setMessages(prev => [...prev, data]);
      });
      socket.on('user-typing', () => setIsTyping(true));
      socket.on('user-stop-typing', () => setIsTyping(false));
      return () => {
        socket.off('receive-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/${userId}`);
      setOtherUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/api/messages/send`, {
        to: userId,
        content: inputValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, res.data]);
      setInputValue('');

      // Emit via socket
      if (socket) {
        socket.emit('send-message', {
          to: userId,
          from: user._id,
          message: inputValue,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="bg-dark h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Header */}
        {otherUser && (
          <div className="bg-darkGray border-b border-gray-700 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-600"></div>
            <div className="flex-1">
              <p className="font-semibold text-white">{otherUser.username}</p>
              <p className="text-sm text-gray-400">{otherUser.isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === user._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.from === user._id
                    ? 'bg-white text-dark'
                    : 'bg-darkGray text-white border border-gray-600'
                }`}
              >
                {msg.content}
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="text-gray-400 text-sm">typing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-darkGray border-t border-gray-700 p-4 flex gap-3">
          <button className="p-3 bg-dark rounded-lg hover:bg-gray-900 transition text-white">
            <FaImage />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-dark px-4 py-2 rounded-lg text-white outline-none border border-gray-600 focus:border-white"
          />
          <button className="p-3 bg-dark rounded-lg hover:bg-gray-900 transition text-white">
            <FaMicrophone />
          </button>
          <button
            onClick={handleSendMessage}
            className="p-3 bg-white rounded-lg hover:bg-gray-200 transition text-dark"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
