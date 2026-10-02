import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { loginStart, loginSuccess, loginError } from '../redux/authSlice';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.msg || 'Login failed';
      setError(message);
      dispatch(loginError(message));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark">
      <div className="w-full max-w-md">
        {/* YAP Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl font-black mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            YAP
          </div>
          <p className="text-gray-400">Connect. Share. Express.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-darkGray p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-900 text-red-100 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-2">Email</label>
            <div className="flex items-center bg-dark px-4 py-3 rounded-lg border border-gray-600 focus-within:border-white">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full outline-none text-white"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-gray-300 text-sm block mb-2">Password</label>
            <div className="flex items-center bg-dark px-4 py-3 rounded-lg border border-gray-600 focus-within:border-white">
              <FaLock className="text-gray-400 mr-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent w-full outline-none text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-dark font-bold py-3 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-white hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
