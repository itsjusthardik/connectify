import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { AnimatedInput } from '../../components/ui/AnimatedInput';
import { GlowButton } from '../../components/ui/GlowButton';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import { Eye, EyeOff } from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('/admin/login', formData);
      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem('adminToken', token);
        toast.success('Admin login successful!');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar onNotificationClick={() => {}} />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-md space-y-6"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <Link to="/" className="flex items-center justify-center gap-2 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <span className="text-2xl font-bold font-display">Connectify Admin</span>
            </Link>
            <h1 className="font-display text-4xl font-bold mb-2">Admin Login</h1>
            <p className="text-text-secondary">
              Access the admin dashboard
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="glass-card p-8 rounded-lg space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <AnimatedInput
                label="Admin Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="admin@connectify.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <AnimatedInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <GlowButton
              onClick={handleLogin}
              fullWidth
              loading={loading}
              size="lg"
            >
              Sign In
            </GlowButton>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <p className="text-text-secondary text-sm">
              Not an admin?{' '}
              <Link to="/" className="text-primary hover:underline">
                Go back home
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminLogin;
