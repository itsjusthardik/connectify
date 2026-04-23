import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AuthCard } from '../components/AuthCard';
import { BackgroundBlob } from '../components/BackgroundBlob';

// Input validation helpers
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: '',
      general: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors({ ...newErrors, general: '' });
      return;
    }

    setLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      const response = await authAPI.login(formData);
      if (response.data.success) {
        login(response.data.admin, response.data.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.response?.data?.message || 'Login failed. Please check your credentials.',
      }));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-4 relative">
      <BackgroundBlob />

      <div className="relative z-10">
        <AuthCard title="Admin Login">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.3 }}
            >
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`input-focus w-full px-4 py-3 bg-neutral-800/50 border rounded-lg focus:outline-none text-white placeholder-neutral-500 transition-all duration-200 ${
                  errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-700 focus:border-violet'
                }`}
                required
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`input-focus w-full px-4 py-3 bg-neutral-800/50 border rounded-lg focus:outline-none text-white placeholder-neutral-500 transition-all duration-200 ${
                  errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-700 focus:border-violet'
                }`}
                required
              />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* General Error Message */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3"
              >
                {errors.general}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 30px rgba(124, 58, 237, 0.4)' }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 mt-6 rounded-lg font-semibold font-display text-white bg-gradient-to-r from-violet to-blue hover:from-violet/80 hover:to-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group flex items-center justify-center gap-2"
            >
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              )}
              <span className="relative z-10">
                {loading ? 'Signing in...' : 'Sign In'}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-violet/20 to-blue/20" />
            </motion.button>

            {/* Register Link */}
            <p className="text-center text-neutral-400 text-sm">
              Don't have an account?{' '}
              <Link to="/admin/register" className="text-violet hover:text-violet/80 transition-colors">
                Create one
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
};
