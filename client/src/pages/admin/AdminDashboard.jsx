import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, TrendingUp, BarChart3, LogOut } from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeConnections: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login', { replace: true });
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, requestsRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/requests'),
      ]);

      const requestsData = requestsRes.data.requests || [];
      const acceptedCount = requestsData.filter(r => r.status === 'accepted').length;
      const pendingCount = requestsData.filter(r => r.status === 'pending').length;

      setStats({
        totalUsers: (usersRes.data.users || []).length,
        activeConnections: acceptedCount,
        pendingRequests: pendingCount,
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out');
    navigate('/admin/login', { replace: true });
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
                  Admin Dashboard
                </h1>
                <p className="text-text-secondary">
                  Platform overview and statistics
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-error text-white rounded-lg hover:bg-error/90 transition-all"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">Loading statistics...</div>
          ) : (
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
                    <p className="text-text-secondary text-sm">Total Users</p>
                    <p className="text-4xl font-bold text-primary mt-2">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <Users size={40} className="text-primary/30" />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="glass-card p-6 rounded-lg border border-border-color"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Active Connections</p>
                    <p className="text-4xl font-bold text-secondary mt-2">
                      {stats.activeConnections}
                    </p>
                  </div>
                  <TrendingUp size={40} className="text-secondary/30" />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="glass-card p-6 rounded-lg border border-border-color"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Pending Requests</p>
                    <p className="text-4xl font-bold text-cyan mt-2">
                      {stats.pendingRequests}
                    </p>
                  </div>
                  <BarChart3 size={40} className="text-cyan/30" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="glass-card p-6 rounded-lg border border-border-color"
          >
            <h2 className="font-bold text-xl mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                variants={itemVariants}
                className="px-6 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary/90 transition-all"
              >
                View All Users
              </motion.button>
              <motion.button
                variants={itemVariants}
                className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-all"
              >
                Manage Requests
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
