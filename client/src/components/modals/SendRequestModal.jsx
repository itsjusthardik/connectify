import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AnimatedInput } from '../ui/AnimatedInput';
import { GlowButton } from '../ui/GlowButton';
import toast from 'react-hot-toast';
import axios from '../../api/axios';

/**
 * SendRequestModal Component
 * Modal to compose and send connection requests
 */
export const SendRequestModal = ({ isOpen, onClose, recipientId, recipientName }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!message.trim()) {
      newErrors.message = 'Please write a message';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post('/requests/send', {
        receiverId: recipientId,
        message: message.trim(),
      });
      toast.success('Request sent successfully!');
      setMessage('');
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send request';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: { opacity: 0, scale: 0.9, y: 20 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-8 rounded-lg w-full max-w-md border border-border-color"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Send Request</h2>
                <p className="text-text-secondary text-sm">
                  Connect with {recipientName}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-dark/50 rounded-lg transition-all"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Message */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) {
                      setErrors(prev => ({ ...prev, message: '' }));
                    }
                  }}
                  placeholder="Hi! I'd like to connect with you..."
                  rows="5"
                  className={`w-full px-4 py-3 rounded-lg bg-dark/50 border text-white placeholder-text-secondary focus:outline-none transition-all ${
                    errors.message ? 'border-error' : 'border-border-color focus:border-primary'
                  }`}
                />
                {errors.message && (
                  <p className="text-error text-sm mt-2">{errors.message}</p>
                )}
                <p className="text-text-secondary text-xs mt-2">
                  {message.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-all font-semibold"
                >
                  Cancel
                </motion.button>
                <GlowButton
                  onClick={handleSend}
                  loading={loading}
                  className="flex-1"
                >
                  Send Request
                </GlowButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SendRequestModal;
