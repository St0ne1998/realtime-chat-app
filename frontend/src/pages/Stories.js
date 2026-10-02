import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Stories() {
  const { user, token } = useSelector(state => state.auth);
  const [stories, setStories] = useState([]);
  const socket = window.socket;

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('story-added', (newStory) => {
        setStories(prev => [newStory, ...prev]);
      });
      return () => socket.off('story-added');
    }
  }, [socket]);

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/stories/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStories(res.data);
    } catch (err) {
      console.error('Error fetching stories:', err);
    }
  };

  return (
    <div className="bg-dark min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mb-6">Stories</h1>
        {stories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stories.map(story => (
              <div key={story._id} className="relative rounded-lg overflow-hidden group cursor-pointer h-96">
                {story.mediaType === 'text' ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center p-4">
                    <p className="text-white text-center">{story.content}</p>
                  </div>
                ) : story.mediaType === 'image' ? (
                  <img src={`${API_URL}${story.mediaUrl}`} alt="Story" className="w-full h-full object-cover" />
                ) : (
                  <video src={`${API_URL}${story.mediaUrl}`} className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-white font-semibold text-sm">{story.userId?.username}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No stories from your followers yet</div>
        )}
      </div>
    </div>
  );
}

export default Stories;
