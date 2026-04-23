import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';

export const RequestsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [sentRes, receivedRes] = await Promise.all([
        axios.get('/requests/my-requests'),
        axios.get('/requests/received')
      ]);
      setRequests([
        ...(sentRes.data.requests || []),
        ...(receivedRes.data.requests || [])
      ]);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.put(`/requests/${requestId}/accept`);
      toast.success('Request accepted!');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await axios.put(`/requests/${requestId}/decline`);
      toast.success('Request declined');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  const receivedRequests = requests.filter(r => r.receiver?._id === user?._id);
  const sentRequests = requests.filter(r => r.sender?._id === user?._id);
  const displayRequests = activeTab === 'received' ? receivedRequests : sentRequests;

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
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />

        <main className="flex-1 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="font-display text-4xl font-bold mb-4">Connection Requests</h1>
              <p className="text-text-secondary">Manage your incoming and outgoing connection requests</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-border-color">
              <button
                onClick={() => setActiveTab('received')}
                className={`px-4 py-2 font-semibold transition-all ${
                  activeTab === 'received'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                Received ({receivedRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`px-4 py-2 font-semibold transition-all ${
                  activeTab === 'sent'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                Sent ({sentRequests.length})
              </button>
            </div>

            {/* Requests List */}
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : displayRequests.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                No {activeTab} requests yet
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {displayRequests.map((request) => {
                  const otherUser = activeTab === 'received' ? request.sender : request.receiver;
                  const isPending = request.status === 'pending';

                  return (
                    <motion.div
                      key={request._id}
                      variants={itemVariants}
                      className="glass-card p-6 rounded-lg border border-border-color"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-bold text-primary">
                              {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{otherUser?.name || 'Unknown User'}</h3>
                            <p className="text-text-secondary text-sm capitalize">
                              {otherUser?.role?.replace(/_/g, ' ') || 'User'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {request.status === 'pending' && activeTab === 'received' && (
                            <>
                              <button
                                onClick={() => handleAccept(request._id)}
                                className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-all"
                              >
                                <CheckCircle size={24} />
                              </button>
                              <button
                                onClick={() => handleDecline(request._id)}
                                className="p-2 rounded-lg bg-error/20 text-error hover:bg-error/30 transition-all"
                              >
                                <XCircle size={24} />
                              </button>
                            </>
                          )}
                          {request.status === 'accepted' && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-success">
                                <CheckCircle size={20} />
                                <span className="text-sm font-semibold">Connected</span>
                              </div>
                              <Link
                                to={`/chat?user=${otherUser?._id || otherUser?.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-sm font-semibold"
                              >
                                <MessageCircle size={16} />
                                Message
                              </Link>
                            </div>
                          )}
                          {request.status === 'pending' && activeTab === 'sent' && (
                            <div className="flex items-center gap-1 text-secondary">
                              <Clock size={20} />
                              <span className="text-sm font-semibold">Pending</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default RequestsPage;
