import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AnimatedInput } from '../ui/AnimatedInput';
import { GlowButton } from '../ui/GlowButton';
import toast from 'react-hot-toast';
import { Eye, EyeOff, X, Users, Zap, Palette, ShoppingCart, Sparkles } from 'lucide-react';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    authModalMode, 
    setAuthModalMode,
    login,
    register 
  } = useAuth();
  
  const navigate = useNavigate();

  // Common State
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Registration specifics
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    customRole: '',
    bio: '',
    niche: [],
    skills: [],
    hourlyRate: '',
    experienceYears: '',
    businessName: '',
    businessType: '',
  });

  // Reset state when modal opens/closes or switches mode
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep(1);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
      // Don't clear email/password to allow easy switching between login/register
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const dashboardMap = {
    'Content Creator': '/dashboard/creator',
    'Video Editor': '/dashboard/editor',
    'Graphic Designer': '/dashboard/designer',
    'Consumer': '/dashboard/consumer',
    'Other': '/dashboard/other',
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const toggleNiche = (niche) => {
    setFormData(prev => ({
      ...prev,
      niche: prev.niche.includes(niche)
        ? prev.niche.filter(n => n !== niche)
        : [...prev.niche, niche],
    }));
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async () => {
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      if (response?.user?.role) {
        toast.success('Login successful!');
        setAuthModalOpen(false);
        navigate(dashboardMap[response.user.role] || '/dashboard', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else {
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Password must contain an uppercase letter';
      else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Password must contain a number';
      else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) newErrors.password = 'Password must contain a special character';
    }
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (selectedRole === 'Other' && !formData.customRole.trim()) newErrors.customRole = 'Please describe your role';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async () => {
    if (!validateRegister()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      };

      if (selectedRole === 'Other') {
        payload.customRole = formData.customRole.trim();
      } else if (selectedRole === 'Content Creator') {
        payload.bio = formData.bio;
        payload.niche = formData.niche;
      }

      const response = await register(payload);
      if (response.success) {
        toast.success('Account created successfully!');
        setAuthModalOpen(false);
        navigate(dashboardMap[selectedRole] || '/dashboard', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'Content Creator', title: 'Content Creator', icon: Users, desc: 'Create content and collaborate' },
    { id: 'Video Editor', title: 'Video Editor', icon: Zap, desc: 'Offer your editing skills' },
    { id: 'Graphic Designer', title: 'Graphic Designer', icon: Palette, desc: 'Provide design services' },
    { id: 'Consumer', title: 'Consumer', icon: ShoppingCart, desc: 'Hire creators for your brand' },
    { id: 'Other', title: 'Other', icon: Sparkles, desc: 'Define your own role' },
  ];
  
  const nicheOptions = ['Gaming', 'Vlogging', 'Fitness', 'Beauty & Makeup', 'Technology'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
        onClick={() => setAuthModalOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card rounded-2xl shadow-2xl p-6 md:p-8"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors bg-dark/50 p-2 rounded-full"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-8 mt-2">
            <h2 className="text-3xl font-display font-bold mb-2">
              {authModalMode === 'login' ? 'Welcome Back' : (step === 1 ? 'Join Connectify' : 'Create Account')}
            </h2>
            <p className="text-text-secondary">
              {authModalMode === 'login' ? 'Sign in to access your dashboard' : (step === 1 ? 'Choose your role to get started' : 'Just a few more details')}
            </p>
          </div>

          {/* Main Content Area */}
          <div className="mb-6">
            
            {/* LOGIN MODE */}
            {authModalMode === 'login' && (
              <form 
                className="space-y-5" 
                onSubmit={(e) => { e.preventDefault(); handleLoginSubmit(); }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <AnimatedInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <AnimatedInput
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    rightElement={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-secondary hover:text-white">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember-me" className="accent-primary" />
                    <label htmlFor="remember-me" className="text-text-secondary">Remember me</label>
                  </div>
                  <button type="button" className="text-primary hover:underline">Forgot password?</button>
                </div>
                <GlowButton type="submit" fullWidth loading={loading} size="lg">
                  Sign In
                </GlowButton>
              </form>
            )}

            {/* REGISTER MODE - STEP 1 (Role Selection) */}
            {authModalMode === 'register' && step === 1 && (
              <div className="space-y-3">
                {roles.map(role => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => { setSelectedRole(role.id); setStep(2); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border-color bg-dark/30 hover:border-primary hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="p-3 bg-primary/20 rounded-lg text-primary">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{role.title}</h4>
                        <p className="text-xs text-text-secondary">{role.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* REGISTER MODE - STEP 2 (Form) */}
            {authModalMode === 'register' && step === 2 && (
              <form 
                className="space-y-5"
                onSubmit={(e) => { e.preventDefault(); handleRegisterSubmit(); }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <AnimatedInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} error={errors.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <AnimatedInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <AnimatedInput
                    label="Password (min 8 chars)"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    rightElement={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-secondary hover:text-white">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <AnimatedInput
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    rightElement={
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-text-secondary hover:text-white">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </div>
                
                {selectedRole === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Role</label>
                    <AnimatedInput label="Describe your role" name="customRole" value={formData.customRole} onChange={handleInputChange} error={errors.customRole} />
                  </div>
                )}

                {selectedRole === 'Content Creator' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Niches</label>
                    <div className="flex flex-wrap gap-2">
                       {nicheOptions.map(niche => (
                        <button
                          type="button"
                          key={niche}
                          onClick={() => toggleNiche(niche)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all ${
                            formData.niche.includes(niche) ? 'bg-primary border-primary text-white' : 'border-border-color text-text-secondary hover:text-white hover:border-text-secondary'
                          }`}
                        >
                          {niche}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 text-sm font-medium rounded-lg border border-border-color hover:bg-dark/50 transition-colors">
                    Back
                  </button>
                  <div className="flex-[2]">
                    <GlowButton type="submit" fullWidth loading={loading} size="lg">
                      Create Account
                    </GlowButton>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer toggle */}
          <div className="text-center pt-4 border-t border-border-color/50 text-sm">
            {authModalMode === 'login' ? (
              <p className="text-text-secondary">
                Don't have an account?{' '}
                <button onClick={() => { setStep(1); setAuthModalMode('register'); }} className="text-primary hover:underline font-semibold">
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-text-secondary">
                Already have an account?{' '}
                <button onClick={() => setAuthModalMode('login')} className="text-primary hover:underline font-semibold">
                  Log in
                </button>
              </p>
            )}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
