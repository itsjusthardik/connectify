import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GlowButton } from '../components/ui/GlowButton';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { Users, Zap, Palette, ShoppingCart, Sparkles, Eye, EyeOff } from 'lucide-react';

/**
 * Register Page
 * Step 1: Role Selection (5 options including "Other")
 * Step 2: Role-specific registration form
 * Features: password visibility toggle, password strength meter
 */
export const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: role selection, 2: form
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [errors, setErrors] = useState({});

  const roles = [
    {
      id: 'content_creator',
      title: 'Content Creator',
      icon: Users,
      description: 'Create content and find talent to collaborate with',
    },
    {
      id: 'video_editor',
      title: 'Video Editor',
      icon: Zap,
      description: 'Offer your editing skills to creators',
    },
    {
      id: 'graphic_designer',
      title: 'Graphic Designer',
      icon: Palette,
      description: 'Provide design services to creators',
    },
    {
      id: 'consumer',
      title: 'Consumer',
      icon: ShoppingCart,
      description: 'Browse and hire creators for your brand',
    },
    {
      id: 'other',
      title: 'Other',
      icon: Sparkles,
      description: 'Something else entirely — define your own role',
    },
  ];

  const nicheOptions = [
    'Gaming', 'Vlogging', 'Fitness', 'Beauty & Makeup', 'Fashion',
    'Cooking', 'Technology', 'Travel', 'Music', 'Comedy',
  ];

  const skillOptions = [
    'Adobe Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'Adobe After Effects',
    'Motion Graphics', 'Color Grading', 'Adobe Photoshop', 'Adobe Illustrator',
    'Figma', 'Canva', 'UI/UX Design', 'Video Animation',
  ];

  // Password strength calculator
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0-4
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  const passwordStrength = getPasswordStrength(formData.password);

  // Validate form based on role
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(formData.password))
      newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/[0-9]/.test(formData.password))
      newErrors.password = 'Password must contain at least one number';
    else if (!/[^A-Za-z0-9]/.test(formData.password))
      newErrors.password = 'Password must contain at least one special character';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (selectedRole === 'other' && !formData.customRole.trim())
      newErrors.customRole = 'Please describe your role';

    if (selectedRole === 'content_creator' && formData.niche.length === 0)
      newErrors.niche = 'Please select at least one niche';

    if ((selectedRole === 'video_editor' || selectedRole === 'graphic_designer') && formData.skills.length === 0)
      newErrors.skills = 'Please select at least one skill';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      };

      if (selectedRole === 'other') {
        payload.customRole = formData.customRole.trim();
      } else if (selectedRole === 'content_creator') {
        payload.bio = formData.bio;
        payload.niche = formData.niche;
      } else if (selectedRole === 'video_editor' || selectedRole === 'graphic_designer') {
        payload.skills = formData.skills;
        payload.hourlyRate = parseInt(formData.hourlyRate) || 0;
        payload.experienceYears = parseInt(formData.experienceYears) || 0;
      } else if (selectedRole === 'consumer') {
        payload.businessName = formData.businessName;
        payload.businessType = formData.businessType;
      }

      const response = await axios.post('/auth/register', payload);
      
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        sessionStorage.setItem('accessToken', accessToken);
        toast.success('Account created successfully!');
        const dashboardPath = selectedRole === 'content_creator' ? 'creator'
          : selectedRole === 'video_editor' ? 'editor'
          : selectedRole === 'graphic_designer' ? 'designer'
          : selectedRole === 'consumer' ? 'consumer'
          : 'creator'; // other role uses creator dashboard
        navigate(`/dashboard/${dashboardPath}`, { replace: true });
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleNiche = (niche) => {
    setFormData(prev => ({
      ...prev,
      niche: prev.niche.includes(niche)
        ? prev.niche.filter(n => n !== niche)
        : [...prev.niche, niche],
    }));
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '', email: '', password: '', confirmPassword: '',
      customRole: '', bio: '', niche: [], skills: [],
      hourlyRate: '', experienceYears: '', businessName: '', businessType: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar onNotificationClick={() => {}} />

      <main className="flex-1 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-12">
                <h1 className="font-display text-4xl font-bold mb-4">Join Connectify</h1>
                <p className="text-text-secondary text-lg">Choose your role to get started</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <motion.button
                      key={role.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedRole(role.id); setStep(2); }}
                      className={`glass-card p-6 rounded-lg text-left transition-all ${
                        selectedRole === role.id
                          ? 'border-primary bg-primary/20'
                          : 'border-border-color hover:border-primary'
                      }`}
                    >
                      <Icon className="w-12 h-12 text-primary mb-4" />
                      <h3 className="font-bold text-xl mb-2">{role.title}</h3>
                      <p className="text-text-secondary text-sm">{role.description}</p>
                    </motion.button>
                  );
                })}
              </div>

              <p className="text-center text-text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">Sign in here</Link>
              </p>
            </motion.div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="font-display text-4xl font-bold">
                    {roles.find(r => r.id === selectedRole)?.title}
                  </h1>
                  <p className="text-text-secondary mt-2">
                    {roles.find(r => r.id === selectedRole)?.description}
                  </p>
                </div>
                <button onClick={resetForm} className="text-primary hover:underline">
                  Change Role
                </button>
              </div>

              <div className="glass-card p-8 rounded-lg space-y-6">
                {/* Basic Fields */}
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
                    placeholder="you@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="flex-1 h-1 rounded-full transition-colors"
                              style={{
                                backgroundColor: i < passwordStrength
                                  ? strengthColors[passwordStrength]
                                  : '#3f3f46'
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: strengthColors[passwordStrength] || '#888' }}>
                          {strengthLabels[passwordStrength] || 'Very Weak'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                      <AnimatedInput
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        error={errors.confirmPassword}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Other Role Custom Field */}
                {selectedRole === 'other' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Describe your role</label>
                    <AnimatedInput
                      label="Your Role"
                      name="customRole"
                      value={formData.customRole}
                      onChange={handleInputChange}
                      error={errors.customRole}
                      placeholder="e.g. Photographer, Podcaster, Animator..."
                    />
                  </div>
                )}

                {/* Content Creator Fields */}
                {selectedRole === 'content_creator' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <AnimatedInput
                        label="Tell us about yourself"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Your bio..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Niches {errors.niche && <span className="text-red-400">{errors.niche}</span>}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {nicheOptions.map(niche => (
                          <motion.button
                            key={niche}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => toggleNiche(niche)}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                              formData.niche.includes(niche)
                                ? 'bg-primary text-white'
                                : 'border border-primary text-primary hover:bg-primary/10'
                            }`}
                          >
                            {niche}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Editor/Designer Fields */}
                {(selectedRole === 'video_editor' || selectedRole === 'graphic_designer') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Skills {errors.skills && <span className="text-red-400">{errors.skills}</span>}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {skillOptions.map(skill => (
                          <motion.button
                            key={skill}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => toggleSkill(skill)}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                              formData.skills.includes(skill)
                                ? 'bg-primary text-white'
                                : 'border border-primary text-primary hover:bg-primary/10'
                            }`}
                          >
                            {skill}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Hourly Rate (₹)</label>
                        <AnimatedInput
                          label="Rate"
                          type="number"
                          name="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={handleInputChange}
                          placeholder="500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Years of Experience</label>
                        <AnimatedInput
                          label="Experience"
                          type="number"
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleInputChange}
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Consumer Fields */}
                {selectedRole === 'consumer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Name</label>
                      <AnimatedInput
                        label="Business Name"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="Your Business"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Type</label>
                      <AnimatedInput
                        label="Business Type"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        placeholder="E-commerce, SaaS, etc."
                      />
                    </div>
                  </>
                )}

                {/* Submit */}
                <GlowButton onClick={handleRegister} fullWidth loading={loading} size="lg">
                  Create Account
                </GlowButton>

                <p className="text-center text-text-secondary text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
