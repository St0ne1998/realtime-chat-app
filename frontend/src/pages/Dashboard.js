import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FaHeart, FaComment, FaShare, FaPlus } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard() {
  const { user, token } = useSelector(state => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/posts/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark min-h-screen">
      <Navbar />
      <div className="flex max-w-7xl mx-auto gap-6 p-4">
        <Sidebar />
        
        <div className="flex-1">
          {/* Create Post Button */}
          <div className="bg-darkGray border border-gray-700 rounded-lg p-4 mb-6">
            <Link
              to="/posts"
              className="flex items-center gap-3 w-full p-3 bg-dark rounded-lg hover:bg-gray-900 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0"></div>
              <span className="text-gray-400 flex-1">What's on your mind?</span>
              <FaPlus className="text-white" />
            </Link>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading posts...</div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post._id} className="bg-darkGray border border-gray-700 rounded-lg p-4">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{post.userId?.username}</p>
                      <p className="text-sm text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-white mb-4">{post.content}</p>

                  {/* Post Media */}
                  {post.media && post.media.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {post.media.map((media, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden bg-black">
                          {media.type === 'image' ? (
                            <img src={`${API_URL}${media.url}`} alt="Post" className="w-full h-48 object-cover" />
                          ) : (
                            <video src={`${API_URL}${media.url}`} className="w-full h-48 object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-700 text-gray-400">
                    <button className="flex items-center gap-2 hover:text-white transition">
                      <FaHeart /> {post.likes?.length || 0}
                    </button>
                    <button className="flex items-center gap-2 hover:text-white transition">
                      <FaComment /> {post.comments?.length || 0}
                    </button>
                    <button className="flex items-center gap-2 hover:text-white transition">
                      <FaShare /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No posts yet. Follow people to see their posts!</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
