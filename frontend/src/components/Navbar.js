import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHome, FaEnvelope, FaBook, FaUserCircle, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { logout } from '../redux/authSlice';
import { useDispatch } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        const res = await axios.get(`${API_URL}/api/users/search/${query}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-darkGray border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition"
        >
          YAP
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4 relative">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              placeholder="Search users..."
              className="w-full bg-dark pl-10 pr-4 py-2 rounded-full text-white outline-none border border-gray-600 focus:border-white transition"
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-darkGray border border-gray-700 rounded-lg shadow-lg">
              {searchResults.map(result => (
                <button
                  key={result._id}
                  onClick={() => navigate(`/profile/${result._id}`)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-900 transition text-white"
                >
                  {result.username}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="text-white hover:text-gray-300 transition">
            <FaHome size={20} />
          </button>
          <button onClick={() => navigate('/messages')} className="text-white hover:text-gray-300 transition">
            <FaEnvelope size={20} />
          </button>
          <button onClick={() => navigate('/stories')} className="text-white hover:text-gray-300 transition">
            <FaBook size={20} />
          </button>
          <button
            onClick={() => navigate(`/profile/${user?._id}`)}
            className="text-white hover:text-gray-300 transition"
          >
            <FaUserCircle size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="text-white hover:text-gray-300 transition"
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
