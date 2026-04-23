import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { RoleProtectedRoute } from '../components/common/RoleProtectedRoute';
import { CreatorCard } from '../components/cards/CreatorCard';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';

/**
 * BrowseCreators Page
 * Consumers browse and find creators
 * Filter by niche, search by name
 * Send collaboration requests
 */
export const BrowseCreators = () => {
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const niches = [
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

  useEffect(() => {
    fetchCreators();
  }, [page, selectedNiche, searchQuery]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        ...(selectedNiche && { niche: selectedNiche }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await axios.get(`/users/browse/creators?${query}`);
      setCreators(response.data.creators || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch creators', error);
      toast.error('Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCollaboration = async (creatorId) => {
    try {
      await axios.post('/requests/send', {
        receiverId: creatorId,
        type: 'collaboration',
        message: `Hi! I would love to collaborate with you on a project!`,
      });
      toast.success('Collaboration request sent!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send request';
      toast.error(message);
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
      <RoleProtectedRoute allowedRoles={['consumer']}>
        <div className="min-h-screen bg-dark text-white flex flex-col">
          <Navbar onNotificationClick={() => setNotificationOpen(true)} />

          <main className="flex-1 py-12 px-4">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <h1 className="font-display text-4xl font-bold mb-4">Browse Creators</h1>
                <p className="text-text-secondary text-lg">
                  Discover talented creators across various niches
                </p>
              </motion.div>

              {/* Search and Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-lg mb-8"
              >
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-3.5 text-text-secondary" size={20} />
                  <input
                    type="text"
                    placeholder="Search creators by name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="input-field w-full pl-12 pr-4 py-3 rounded-lg border border-border-color focus:border-primary"
                  />
                </div>

                {/* Niches Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Filter size={18} />
                    <span className="font-semibold">Filter by Niche</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setSelectedNiche(null);
                        setPage(1);
                      }}
                      className={`px-4 py-2 rounded-full transition-all ${
                        !selectedNiche
                          ? 'bg-primary text-white'
                          : 'border border-primary text-primary hover:bg-primary/10'
                      }`}
                    >
                      All
                    </motion.button>
                    {niches.map((niche) => (
                      <motion.button
                        key={niche}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedNiche(niche);
                          setPage(1);
                        }}
                        className={`px-4 py-2 rounded-full transition-all ${
                          selectedNiche === niche
                            ? 'bg-primary text-white'
                            : 'border border-primary text-primary hover:bg-primary/10'
                        }`}
                      >
                        {niche}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Creators Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-3 border-white/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : creators.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-text-secondary text-lg">
                    No creators found. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                  >
                    {creators.map((creator) => (
                      <motion.div key={creator._id} variants={itemVariants}>
                        <CreatorCard
                          creator={creator}
                          onRequestCollaboration={handleRequestCollaboration}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center gap-2"
                    >
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <motion.button
                          key={p}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setPage(p)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            page === p
                              ? 'bg-primary text-white'
                              : 'border border-primary text-primary hover:bg-primary/10'
                          }`}
                        >
                          {p}
                        </motion.button>
                      ))}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </main>

          <Footer />
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
};

export default BrowseCreators;
