import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, MapPin, UserPlus } from 'lucide-react';

export const ViewProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/users/${userId}`);
      setProfile(res.data.user || res.data.data);
      
      // Check if already connected
      const connectsRes = await axios.get('/requests/my-requests');
      const requestsData = connectsRes.data.requests || connectsRes.data.data || [];
      const isConnected = requestsData.some(
        r => (r.sender._id === userId || r.receiver._id === userId) && r.status === 'accepted'
      );
      setIsConnected(isConnected);
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await axios.post('/requests/send', {
        receiverId: userId,
        message: `Hi ${profile.name}! I'd like to connect with you.`,
      });
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dark text-white flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />

        <main className="flex-1 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => navigate('/browse')}
              className="flex items-center gap-2 mb-6 text-primary hover:underline"
            >
              <ArrowLeft size={20} />
              Back to Browse
            </button>

            {profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-lg"
              >
                {/* Avatar */}
                <div className="text-center mb-8">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-6xl font-bold text-primary">
                      {profile.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display text-4xl font-bold mb-2">{profile.name}</h1>
                    <p className="text-primary capitalize text-lg">
                      {profile.role?.replace(/_/g, ' ')}
                    </p>
                  </div>

                  {profile.bio && (
                    <div>
                      <h2 className="font-bold mb-2">About</h2>
                      <p className="text-text-secondary">{profile.bio}</p>
                    </div>
                  )}

                  {profile.niche && profile.niche.length > 0 && (
                    <div>
                      <h2 className="font-bold mb-2">Specializations</h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.niche.map(n => (
                          <span key={n} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {currentUser?._id !== profile._id && (
                    <button
                      onClick={handleConnect}
                      disabled={isConnected}
                      className={`w-full px-6 py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                        isConnected
                          ? 'bg-success/20 text-success cursor-default'
                          : 'bg-primary text-dark hover:bg-primary/90'
                      }`}
                    >
                      <UserPlus size={20} />
                      {isConnected ? 'Connected' : 'Send Connection Request'}
                    </button>
                  )}
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
