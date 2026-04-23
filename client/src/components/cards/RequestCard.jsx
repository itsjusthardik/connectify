import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

/**
 * RequestCard Component
 * Shows individual connection request with name, role, and action buttons
 */
export const RequestCard = ({ request, type = 'received', onAccept, onDecline }) => {
  const otherUser = type === 'received' ? request.sender : request.receiver;
  const isPending = request.status === 'pending';

  const getStatusIcon = () => {
    if (request.status === 'accepted') {
      return <CheckCircle size={24} className="text-success" />;
    }
    if (request.status === 'declined') {
      return <XCircle size={24} className="text-error" />;
    }
    return <Clock size={24} className="text-secondary" />;
  };

  const getStatusColor = () => {
    if (request.status === 'accepted') return 'text-success';
    if (request.status === 'declined') return 'text-error';
    return 'text-secondary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="glass-card p-6 rounded-lg border border-border-color"
    >
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-primary text-lg">
              {otherUser.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-lg">{otherUser.name}</h3>
            <p className="text-text-secondary text-sm capitalize">
              {otherUser.role?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Status/Actions */}
        <div className="flex items-center gap-3">
          {isPending && type === 'received' && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => onAccept?.(request._id)}
                className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-all"
                title="Accept"
              >
                <CheckCircle size={24} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => onDecline?.(request._id)}
                className="p-2 rounded-lg bg-error/20 text-error hover:bg-error/30 transition-all"
                title="Decline"
              >
                <XCircle size={24} />
              </motion.button>
            </>
          )}
          {!isPending && (
            <div className={`flex items-center gap-2 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="text-sm font-semibold capitalize">
                {request.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Message if available */}
      {request.message && (
        <p className="text-text-secondary text-sm mt-4 italic">
          "{request.message}"
        </p>
      )}
    </motion.div>
  );
};

export default RequestCard;
