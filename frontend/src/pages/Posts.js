import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Posts() {
  const { user, token } = useSelector(state => state.auth);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const socket = window.socket;

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMedia(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!content.trim() && media.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      media.forEach(file => formData.append('media', file));

      const res = await axios.post(`${API_URL}/api/posts/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Emit via socket
      if (socket) {
        socket.emit('new-post', res.data);
      }

      // Reset form
      setContent('');
      setMedia([]);
      setPreviews([]);
      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-darkGray border border-gray-700 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Create a Post</h1>

          {/* Content Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-dark text-white p-4 rounded-lg border border-gray-600 focus:border-white outline-none mb-4 resize-none"
            rows="6"
          />

          {/* Media Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden bg-black">
                  {media[idx].type.startsWith('image') ? (
                    <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
                  ) : (
                    <video src={preview} className="w-full h-40 object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(idx)}
                    className="absolute top-2 right-2 bg-red-600 p-2 rounded-full hover:bg-red-700 transition"
                  >
                    <FaTimes className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <label className="flex-1 flex items-center justify-center gap-2 bg-dark hover:bg-gray-900 px-4 py-2 rounded-lg text-white cursor-pointer transition border border-gray-600">
              <FaImage /> Add Image
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 bg-dark hover:bg-gray-900 px-4 py-2 rounded-lg text-white cursor-pointer transition border border-gray-600">
              <FaVideo /> Add Video
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCreatePost}
            disabled={loading || (!content.trim() && media.length === 0)}
            className="w-full bg-white text-dark font-bold py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Posts;
