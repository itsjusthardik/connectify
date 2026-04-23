import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GlowButton } from '../components/ui/GlowButton';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Login Page
 * Email and password login
 * Redirects to role-specific dashboard after login
 * Password visibility toggle enabled
 */
export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      const response = await login(formData.email, formData.password);
      if (response?.user?.role) {
        toast.success('Login successful!');
        const dashboardMap = {
          content_creator: '/dashboard/creator',
          video_editor: '/dashboard/editor',
          graphic_designer: '/dashboard/designer',
          consumer: '/dashboard/consumer',
          other: '/dashboard/creator', // other role uses creator dashboard
        };
        navigate(dashboardMap[response.user.role] || '/dashboard', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
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
        {/* Animated Background */}
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-md"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <Link to="/" className="flex items-center justify-center gap-2 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <span className="text-2xl font-bold font-display">Connectify</span>
            </Link>
            <h1 className="font-display text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-text-secondary">
              Sign in to your Connectify account
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-8 rounded-lg space-y-6 mb-6"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <AnimatedInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Password</label>
                <button className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
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

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded bg-dark/50 border border-border-color accent-primary"
              />
              <label htmlFor="remember" className="text-sm text-text-secondary">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <GlowButton
              onClick={handleLogin}
              fullWidth
              loading={loading}
              size="lg"
            >
              Sign In
            </GlowButton>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-color"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark text-text-secondary">
                Don't have an account?
              </span>
            </div>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div variants={itemVariants}>
            <Link
              to="/register"
              className="w-full block px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-all text-center"
            >
              Create Account
            </Link>
          </motion.div>

          {/* Admin Login Link */}
          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-text-secondary text-sm">
              Admin?{' '}
              <Link to="/admin/login" className="text-secondary hover:underline">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
