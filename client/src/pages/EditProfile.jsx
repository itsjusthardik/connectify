import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GlowButton } from '../components/ui/GlowButton';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

/**
 * EditProfile Page
 * Edit user profile with role-specific fields
 * Upload profile image
 */
export const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    niche: [],
    skills: [],
    hourlyRate: '',
    experienceYears: '',
    businessName: '',
    businessType: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const nicheOptions = [
    'Gaming',
    'Vlogging',
    'Fitness',
    'Beauty & Makeup',
    'Fashion',
    'Cooking',
    'Technology',
    'Travel',
    'Music',
    'Comedy',
    'Education',
    'Business',
  ];

  const skillOptions = [
    'Adobe Premiere Pro',
    'DaVinci Resolve',
    'Final Cut Pro',
    'Adobe After Effects',
    'Motion Graphics',
    'Color Grading',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Figma',
    'Canva',
    'UI/UX Design',
    'Video Animation',
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        niche: user.niche || [],
        skills: user.skills || [],
        hourlyRate: user.hourlyRate || '',
        experienceYears: user.experienceYears || '',
        businessName: user.businessName || '',
        businessType: user.businessType || '',
      });
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Update profile
      await axios.put('/users/profile', {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        ...( user?.role === 'Content Creator' && { niche: formData.niche }),
        ...((['Video Editor', 'Graphic Designer'].includes(user?.role)) && {
          skills: formData.skills,
          hourlyRate: parseInt(formData.hourlyRate) || 0,
          experienceYears: parseInt(formData.experienceYears) || 0,
        }),
        ...(user?.role === 'Consumer' && {
          businessName: formData.businessName,
          businessType: formData.businessType,
        }),
      });

      // Upload image if changed
      if (profileImage) {
        const formDataImage = new FormData();
        formDataImage.append('profileImage', profileImage);
        await axios.post('/users/profile/image', formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success('Profile updated successfully!');
      navigate('/profile/me');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar onNotificationClick={() => setNotificationOpen(true)} />

        <main className="flex-1 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="font-display text-4xl font-bold mb-2">
                Edit Your Profile
              </h1>
              <p className="text-text-secondary">
                Update your information to improve your visibility
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 rounded-lg space-y-6"
            >
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-4">Profile Picture</label>
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={imagePreview || 'https://via.placeholder.com/120'}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                  />
                  <div className="flex-1">
                    <label className="px-6 py-3 border-2 border-dashed border-primary text-primary rounded-lg hover:bg-primary/10 cursor-pointer transition-all inline-flex items-center gap-2 font-medium">
                      <Upload size={20} />
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-text-secondary text-sm mt-2">
                      JPG, PNG or GIF (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <AnimatedInput
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <AnimatedInput
                  label="Your Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  className="input-field w-full px-4 py-3 rounded-lg border border-border-color focus:border-primary focus:glow h-24 resize-none"
                />
              </div>

              {/* Role-specific Fields */}
              {user?.role === 'Content Creator' && (
                <div>
                  <label className="block text-sm font-medium mb-3">Niches</label>
                  <div className="flex flex-wrap gap-2">
                    {nicheOptions.map(niche => (
                      <motion.button
                        key={niche}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => toggleNiche(niche)}
                        className={`px-4 py-2 rounded-full transition-all ${
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
              )}

              {['Video Editor', 'Graphic Designer'].includes(user?.role) && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-3">Skills</label>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Hourly Rate ($)</label>
                      <AnimatedInput
                        label="Rate"
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Experience (Years)</label>
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

              {user?.role === 'consumer' && (
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

              {/* Save Button */}
              <GlowButton
                onClick={handleUpdate}
                fullWidth
                loading={loading}
                size="lg"
              >
                Save Changes
              </GlowButton>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default EditProfile;
