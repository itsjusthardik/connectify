import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Mail, MapPin, Globe, ExternalLink, MessageSquare, Star } from 'lucide-react';
import Loader from '../components/common/Loader';

/**
 * ViewProfile Page
 * Display user profile with role-specific details
 * Visitors can connect/request collaboration
 */
export const ViewProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/profile/${userId}`);
      setProfile(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      toast.error(error.response?.data?.message || 'Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (type) => {
    try {
      await axios.post('/requests/send', {
        receiverId: userId,
        type,
        message: `Hi! I'm interested in collaborating with you.`,
      });
      toast.success('Request sent successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send request';
      toast.error(message);
    }
  };

  if (loading) return <Loader />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar onNotificationClick={() => setNotificationOpen(true)} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">Profile not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar onNotificationClick={() => setNotificationOpen(true)} />

        <main className="flex-1 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-lg mb-8"
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <motion.img
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  src={profile.profileImage || 'https://via.placeholder.com/150'}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                />

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="font-display text-4xl font-bold mb-2">
                        {profile.name}
                      </h1>
                      <p className="text-primary capitalize font-semibold">
                        {profile.role.replace('_', ' ')}
                      </p>
                    </div>
                    {profile.isVerified && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-text-secondary mb-4">{profile.bio}</p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-text-secondary mb-6">
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      {profile.email}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {currentUser?._id !== userId && (
                    <div className="flex gap-3">
                      {profile.role === 'Content Creator' && currentUser?.role === 'Consumer' && (
                        <button
                          onClick={() => handleRequest('collaboration')}
                          className="glow-button px-6 py-2 font-semibold flex items-center gap-2"
                        >
                          <MessageSquare size={18} />
                          Request Collaboration
                        </button>
                      )}
                      {(profile.role === 'Video Editor' || profile.role === 'Graphic Designer') && currentUser?.role === 'Content Creator' && (
                        <button
                          onClick={() => handleRequest('connect')}
                          className="glow-button px-6 py-2 font-semibold flex items-center gap-2"
                        >
                          <MessageSquare size={18} />
                          Send Connect Request
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Role-specific Content */}
            {profile.role === 'Content Creator' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-lg mb-8"
              >
                <h2 className="text-2xl font-bold mb-6">Creator Details</h2>

                {/* Niches */}
                {profile.niche && profile.niche.length > 0 && (
                  <div className="mb-6">
                    <p className="text-text-secondary text-sm mb-2">Niches</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.niche.map((n) => (
                        <span
                          key={n}
                          className="px-4 py-2 bg-primary/20 text-primary rounded-full font-medium"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Followers */}
                <p className="text-text-secondary text-sm MB-2">Followers</p>
                <p className="font-bold text-xl text-primary">
                  {(profile.followersCount || 0).toLocaleString()}
                </p>
              </motion.div>
            )}

            {(profile.role === 'Video Editor' || profile.role === 'Graphic Designer') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                {/* Skills */}
                <div className="glass-card p-8 rounded-lg">
                  <h2 className="text-2xl font-bold mb-6">Skills</h2>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 bg-secondary/20 text-secondary rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary">No skills listed</p>
                  )}
                </div>

                {/* Rates & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6 rounded-lg">
                    <p className="text-text-secondary text-sm mb-2">Hourly Rate</p>
                    <p className="text-3xl font-bold text-primary">
                      ${profile.hourlyRate || 0}
                    </p>
                  </div>
                  <div className="glass-card p-6 rounded-lg">
                    <p className="text-text-secondary text-sm mb-2">Experience</p>
                    <p className="text-3xl font-bold text-primary">
                      {profile.experienceYears || 0} years
                    </p>
                  </div>
                </div>

                {/* Portfolio */}
                {profile.portfolioLinks && profile.portfolioLinks.length > 0 && (
                  <div className="glass-card p-8 rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
                    <div className="space-y-2">
                      {profile.portfolioLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors"
                        >
                          <ExternalLink size={16} />
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {profile.role === 'consumer' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-lg"
              >
                <h2 className="text-2xl font-bold mb-6">Business Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-text-secondary text-sm mb-1">Business Name</p>
                    <p className="font-semibold">{profile.businessName || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm mb-1">Business Type</p>
                    <p className="font-semibold">{profile.businessType || 'Not specified'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default ViewProfile;
