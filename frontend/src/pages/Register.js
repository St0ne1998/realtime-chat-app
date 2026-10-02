import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { loginStart, loginSuccess, loginError } from '../redux/authSlice';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    dispatch(loginStart());
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.msg || 'Registration failed';
      setError(message);
      dispatch(loginError(message));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark py-12">
      <div className="w-full max-w-md">
        {/* YAP Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl font-black mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            YAP
          </div>
          <p className="text-gray-400">Join the Conversation</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="bg-darkGray p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
          
          {error && (
            <div className="bg-red-900 text-red-100 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-gray-300 text-sm block mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="yap-input text-sm"
                required
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm block mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="yap-input text-sm"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-2">Username</label>
            <div className="flex items-center bg-dark px-4 py-3 rounded-lg border border-gray-600 focus-within:border-white">
              <FaUser className="text-gray-400 mr-3" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="bg-transparent w-full outline-none text-white text-sm"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-2">Email</label>
            <div className="flex items-center bg-dark px-4 py-3 rounded-lg border border-gray-600 focus-within:border-white">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-transparent w-full outline-none text-white text-sm"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-2">Password</label>
            <div className="flex items-center bg-dark px-4 py-3 rounded-lg border border-gray-600 focus-within:border-white">
              <FaLock className="text-gray-400 mr-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-transparent w-full outline-none text-white text-sm"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-gray-300 text-sm block mb-2">Confirm Password</label>
            <div className="flex items-center bg-dark px-4 py-3 rounded-lg border border-gray-600 focus-within:border-white">
              <FaLock className="text-gray-400 mr-3" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-transparent w-full outline-none text-white text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-dark font-bold py-3 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
