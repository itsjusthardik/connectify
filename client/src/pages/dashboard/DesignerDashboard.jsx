import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import { RoleProtectedRoute } from '../../components/common/RoleProtectedRoute';
import axios from '../../api/axios';
import { Users, Briefcase, Bell, Edit2 } from 'lucide-react';

export const DesignerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const requestsRes = await axios.get('/requests/my-requests');
      const requestsData = requestsRes.data.requests || [];
      const pendingCount = requestsData.filter(r => r.status === 'pending').length;
      const acceptedCount = requestsData.filter(r => r.status === 'accepted').length;

      setStats({
        totalProjects: acceptedCount,
        pendingRequests: pendingCount,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
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
          <Navbar />

          <main className="flex-1 py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-lg mb-8"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-display text-4xl font-bold mb-2">
                      Welcome back, {user?.name}!
                    </h1>
                    <p className="text-text-secondary">
                      Graphic Designer • Showcase your portfolio
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to="/browse"
                      className="px-6 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary/90 transition-all"
                    >
                      Find Clients
                    </Link>
                    <Link
                      to="/profile/me"
                      className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-all font-semibold"
                    >
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              >
                <motion.div
                  variants={itemVariants}
                  className="glass-card p-6 rounded-lg border border-border-color"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Design Projects</p>
                      <p className="text-4xl font-bold text-primary mt-2">
                        {stats.totalProjects}
                      </p>
                    </div>
                    <Briefcase size={40} className="text-primary/30" />
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="glass-card p-6 rounded-lg border border-border-color"
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
                  className="glass-card p-6 rounded-lg border border-border-color"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Client Base</p>
                      <p className="text-4xl font-bold text-cyan mt-2">0</p>
                    </div>
                    <Users size={40} className="text-cyan/30" />
                  </div>
                </motion.div>
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
