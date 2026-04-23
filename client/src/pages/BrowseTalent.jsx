import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { RoleProtectedRoute } from '../components/common/RoleProtectedRoute';
import { EditorCard } from '../components/cards/EditorCard';
import { DesignerCard } from '../components/cards/DesignerCard';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';

/**
 * BrowseTalent Page
 * Creators browse and find talent (editors/designers)
 * Filter by type, skills, experience
 * Send connect requests
 */
export const BrowseTalent = () => {
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [talent, setTalent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [talentType, setTalentType] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const talentTypes = [
    { id: 'Video Editor', name: 'Video Editors' },
    { id: 'Graphic Designer', name: 'Graphic Designers' },
  ];

  const skills = [
    'Adobe Premiere Pro',
    'DaVinci Resolve',
    'Final Cut Pro',
    'Adobe After Effects',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Figma',
    'UI/UX Design',
  ];

  useEffect(() => {
    fetchTalent();
  }, [page, talentType, selectedSkill, searchQuery]);

  const fetchTalent = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        ...(talentType && { type: talentType }),
        ...(selectedSkill && { skill: selectedSkill }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await axios.get(`/users/browse/talent?${query}`);
      setTalent(response.data.talent || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch talent', error);
      toast.error('Failed to load talent');
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnect = async (talentId) => {
    try {
      await axios.post('/requests/send', {
        receiverId: talentId,
        type: 'connect',
        message: `Hi! I would love to work with you on my next project!`,
      });
      toast.success('Connect request sent!');
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
      <RoleProtectedRoute allowedRoles={['Content Creator']}>
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
                <h1 className="font-display text-4xl font-bold mb-4">Browse Talent</h1>
                <p className="text-text-secondary text-lg">
                  Find talented editors and designers to collaborate with
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
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="input-field w-full pl-12 pr-4 py-3 rounded-lg border border-border-color focus:border-primary"
                  />
                </div>

                {/* Type Filter */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter size={18} />
                    <span className="font-semibold">Talent Type</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setTalentType(null);
                        setPage(1);
                      }}
                      className={`px-4 py-2 rounded-full transition-all ${
                        !talentType
                          ? 'bg-primary text-white'
                          : 'border border-primary text-primary hover:bg-primary/10'
                      }`}
                    >
                      All
                    </motion.button>
                    {talentTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setTalentType(type.id);
                          setPage(1);
                        }}
                        className={`px-4 py-2 rounded-full transition-all ${
                          talentType === type.id
                            ? 'bg-primary text-white'
                            : 'border border-primary text-primary hover:bg-primary/10'
                        }`}
                      >
                        {type.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Skills Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Filter size={18} />
                    <span className="font-semibold">Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setSelectedSkill(null);
                        setPage(1);
                      }}
                      className={`px-4 py-2 rounded-full transition-all ${
                        !selectedSkill
                          ? 'bg-primary text-white'
                          : 'border border-primary text-primary hover:bg-primary/10'
                      }`}
                    >
                      All Skills
                    </motion.button>
                    {skills.map((skill) => (
                      <motion.button
                        key={skill}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedSkill(skill);
                          setPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          selectedSkill === skill
                            ? 'bg-primary text-white'
                            : 'border border-primary text-primary hover:bg-primary/10'
                        }`}
                      >
                        {skill}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Talent Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-3 border-white/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : talent.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-text-secondary text-lg">
                    No talent found. Try adjusting your filters.
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
                    {talent.map((person) => (
                      <motion.div key={person._id} variants={itemVariants}>
                        {person.role === 'Video Editor' ? (
                          <EditorCard
                            editor={person}
                            onSendConnect={handleSendConnect}
                          />
                        ) : (
                          <DesignerCard
                            designer={person}
                            onSendConnect={handleSendConnect}
                          />
                        )}
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

export default BrowseTalent;
