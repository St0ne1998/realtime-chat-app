import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLink } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Sidebar() {
  const { user, token } = useSelector(state => state.auth);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    if (user) {
      fetchFollowers();
    }
  }, [user]);

  const fetchFollowers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowers(res.data.followers?.slice(0, 5) || []);
    } catch (err) {
      console.error('Error fetching followers:', err);
    }
  };

  return (
    <div className="w-64 hidden lg:block">
      <div className="bg-darkGray border border-gray-700 rounded-lg p-4 sticky top-20">
        {/* User Info */}
        <Link to={`/profile/${user?._id}`} className="mb-6 block hover:opacity-80 transition">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0"></div>
            <div>
              <p className="font-semibold text-white">{user?.username}</p>
              <p className="text-sm text-gray-400">@{user?.username}</p>
            </div>
          </div>
        </Link>

        <hr className="border-gray-600 mb-4" />

        {/* Recent Followers */}
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <FaUser /> Recent Followers
        </h3>
        {followers.length > 0 ? (
          <div className="space-y-3">
            {followers.map(follower => (
              <Link
                key={follower._id}
                to={`/profile/${follower._id}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark transition"
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0"></div>
                <span className="text-sm text-white truncate">{follower.username}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No followers yet</p>
        )}

        <hr className="border-gray-600 my-4" />

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p className="flex items-center gap-2">
            <FaLink /> <span>Made with passion</span>
          </p>
          <p>© 2024 YAP. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
