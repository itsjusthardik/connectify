import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GlowButton } from '../components/ui/GlowButton';
import axios from '../api/axios';
import toast from 'react-hot-toast';

/**
 * Admin Register Page
 * Admin account creation
 */
export const AdminRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('/admin/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        const { accessToken } = response.data.data;
        sessionStorage.setItem('accessToken', accessToken);
        toast.success('Admin account created!');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <motion.div
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
            <span className="text-2xl font-bold text-secondary font-display">Admin Panel</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Create Admin Account</h1>
          <p className="text-text-secondary">Admin registration</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 rounded-lg space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <AnimatedInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <AnimatedInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <AnimatedInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <AnimatedInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />
          </div>

          <GlowButton
            onClick={handleRegister}
            fullWidth
            loading={loading}
            size="lg"
            variant="secondary"
          >
            Create Admin Account
          </GlowButton>
        </div>

        {/* Login Link */}
        <p className="text-center text-text-secondary">
          Already have an account?{' '}
          <Link to="/admin/login" className="text-secondary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminRegister;
