import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { Edit2, Mail, MapPin, ExternalLink } from 'lucide-react';

export const MyProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/users/profile', formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />

        <main className="flex-1 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-lg"
            >
              <div className="flex justify-between items-start mb-8">
                <h1 className="font-display text-4xl font-bold">My Profile</h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary/90 transition-all"
                >
                  <Edit2 size={18} />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Avatar */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-6xl font-bold text-primary">
                      {formData.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg bg-dark/50 border border-border-color text-white ${
                      isEditing ? 'cursor-text' : 'cursor-default'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    disabled
                    className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-border-color text-text-secondary cursor-default"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <input
                    type="text"
                    value={formData.role?.replace(/_/g, ' ') || ''}
                    disabled
                    className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-border-color text-text-secondary cursor-default"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="4"
                    className={`w-full px-4 py-2 rounded-lg bg-dark/50 border border-border-color text-white ${
                      isEditing ? 'cursor-text' : 'cursor-default'
                    }`}
                    placeholder="Tell others about yourself..."
                  />
                </div>

                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default MyProfile;
