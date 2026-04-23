import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { RoleProtectedRoute } from '../components/common/RoleProtectedRoute';
import axios from '../api/axios';
import { Users, Briefcase, Bell, Edit2, Clock } from 'lucide-react';

/**
 * Designer Dashboard
 * Shows projects, availability, hourly rate, skills
 */
export const DesignerDashboard = () => {
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingRequests: 0,
    avgRating: 4.8,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const requestsRes = await axios.get('/requests/received');
      const pendingCount = requestsRes.data.data.filter(r => r.status === 'pending').length;
      const acceptedCount = requestsRes.data.data.filter(r => r.status === 'accepted').length;

      setRequests(requestsRes.data.data);
      setStats({
        totalProjects: acceptedCount,
        pendingRequests: pendingCount,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
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
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['Graphic Designer']}>
        <div className="min-h-screen bg-dark text-white flex flex-col">
          <Navbar onNotificationClick={() => setNotificationOpen(true)} />

          <main className="flex-1 py-12 px-4">
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-lg mb-8"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-display text-4xl font-bold mb-2">
                      Welcome, {user?.name}!
                    </h1>
                    <p className="text-text-secondary">
                      ${user?.hourlyRate}/hour • {user?.experienceYears} years experience
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to="/requests"
                      className="glow-button px-6 py-3 font-semibold"
                    >
                      View Requests
                    </Link>
                    <Link
                      to="/profile/me"
                      className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-all font-semibold flex items-center gap-2"
                    >
                      <Edit2 size={20} />
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              >
                <motion.div
                  variants={itemVariants}
                  className="glass-card p-6 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Active Projects</p>
                      <p className="text-4xl font-bold text-primary mt-2">
                        {stats.totalProjects}
                      </p>
                    </div>
                    <Briefcase size={40} className="text-primary/30" />
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="glass-card p-6 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Pending Requests</p>
                      <p className="text-4xl font-bold text-secondary mt-2">
                        {stats.pendingRequests}
                      </p>
                    </div>
                    <Bell size={40} className="text-secondary/30" />
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="glass-card p-6 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Avg Rating</p>
                      <p className="text-4xl font-bold text-yellow-400 mt-2">
                        {stats.avgRating}
                      </p>
                    </div>
                    <Clock size={40} className="text-yellow-400/30" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-8 rounded-lg mb-8"
              >
                <h2 className="text-2xl font-bold mb-4">Your Skills</h2>
                {user?.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {user.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-primary/20 text-primary rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">No skills added yet</p>
                )}
              </motion.div>

              {/* Incoming Requests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-8 rounded-lg"
              >
                <h2 className="text-2xl font-bold mb-6">Collaboration Requests</h2>

                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-text-secondary mb-4">
                      No incoming requests yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.slice(0, 5).map((request) => (
                      <motion.div
                        key={request._id}
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-4 bg-dark/50 rounded-lg border border-border-color hover:border-primary transition-colors"
                      >
                        <div>
                          <p className="font-semibold">
                            Request from creator
                          </p>
                          {request.message && (
                            <p className="text-text-secondary text-sm">{request.message}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                          request.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : request.status === 'accepted'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {request.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </main>

          <Footer />
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
};

export default DesignerDashboard;
