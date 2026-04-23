import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import axios from '../../api/axios';
import { Search, Filter } from 'lucide-react';

export const BrowseUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(true);

  const roles = [
    { id: 'all', label: 'All Users' },
    { id: 'Content Creator', label: 'Creators' },
    { id: 'Video Editor', label: 'Editors' },
    { id: 'Graphic Designer', label: 'Designers' },
    { id: 'Consumer', label: 'Consumers' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      const filtered = (res.data.users || []).filter(u => u._id !== user?._id);
      setUsers(filtered);
      setFilteredUsers(filtered);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    if (selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />

        <main className="flex-1 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="font-display text-4xl font-bold mb-4">Browse Community</h1>
              <p className="text-text-secondary">Find and connect with talented creators and professionals</p>
            </motion.div>

            {/* Search and Filter */}
            <div className="glass-card p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark/50 border border-border-color rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      selectedRole === role.id
                        ? 'bg-primary text-dark'
                        : 'bg-dark/50 border border-border-color hover:border-primary'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Grid */}
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((person) => (
                  <motion.div
                    key={person._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-lg border border-border-color hover:border-primary transition-all"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {person.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{person.name}</h3>
                      <p className="text-sm text-primary mb-3 capitalize">
                        {person.role.replace(/_/g, ' ')}
                      </p>
                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                        {person.bio || 'No bio yet'}
                      </p>

                      <button className="w-full px-4 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary/90 transition-all">
                        View Profile
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-text-secondary text-lg">No users found matching your criteria</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default BrowseUsers;
