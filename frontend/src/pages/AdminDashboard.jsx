import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BackgroundBlob } from '../components/BackgroundBlob';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 relative">
      <BackgroundBlob />

      <div className="relative z-10">
        {/* Header */}
        <nav className="border-b border-neutral-800/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet to-blue" />
              <span className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-violet via-blue to-violet">
                Connectify
              </span>
            </motion.div>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-violet/20 hover:bg-violet/30 text-violet transition-colors duration-200"
            >
              Logout
            </motion.button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Welcome Section */}
            <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/50 rounded-2xl p-8">
              <h1 className="text-4xl font-bold font-display mb-3 text-transparent bg-clip-text bg-gradient-to-r from-violet via-blue to-violet">
                Welcome, {admin?.name}! 👋
              </h1>
              <p className="text-neutral-400 text-lg">
                You've successfully connected to the Connectify admin panel. This is your command center for managing the creator economy platform.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Creators', value: '0', icon: '👥' },
                { label: 'Active Projects', value: '0', icon: '🚀' },
                { label: 'Revenue', value: '$0', icon: '💰' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/50 rounded-xl p-6 hover:border-violet/50 transition-colors duration-200"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <p className="text-neutral-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Feature Preview */}
            <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold font-display mb-4 text-white">Coming Soon</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Manage Content Creators',
                  'View Platform Analytics',
                  'Handle Transactions',
                  'Content Moderation',
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-violet" />
                    <span className="text-neutral-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
