import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FaPlus } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Profile() {
  const { userId } = useParams();
  const { user, token } = useSelector(state => state.auth);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/${userId}`);
      setProfileUser(res.data);
      setIsFollowing(res.data.followers?.includes(user._id));
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/posts/user/${userId}`);
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.post(`${API_URL}/api/users/${userId}/unfollow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/users/${userId}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;

  return (
    <div className="bg-dark min-h-screen">
      <Navbar />
      
      {profileUser && (
        <div className="max-w-4xl mx-auto p-4">
          {/* Profile Header */}
          <div className="bg-darkGray border border-gray-700 rounded-lg p-8 mb-6">
            <div className="flex gap-6 items-start">
              <div className="w-32 h-32 rounded-full bg-gray-600 flex-shrink-0"></div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profileUser.firstName} {profileUser.lastName}
                </h1>
                <p className="text-gray-400 mb-4">@{profileUser.username}</p>
                <p className="text-white mb-4">{profileUser.bio}</p>
                <div className="flex gap-6 mb-4">
                  <div>
                    <p className="text-xl font-bold text-white">{profileUser.followers?.length || 0}</p>
                    <p className="text-gray-400 text-sm">Followers</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{profileUser.following?.length || 0}</p>
                    <p className="text-gray-400 text-sm">Following</p>
                  </div>
                </div>
                {user._id !== userId && (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      isFollowing
                        ? 'bg-darkGray border border-gray-600 text-white hover:bg-gray-900'
                        : 'bg-white text-dark hover:bg-gray-200'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* User Posts */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Posts</h2>
            {posts.length > 0 ? (
              <div className="grid gap-4">
                {posts.map(post => (
                  <div key={post._id} className="bg-darkGray border border-gray-700 rounded-lg p-4">
                    <p className="text-white mb-4">{post.content}</p>
                    {post.media && post.media.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No posts yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
