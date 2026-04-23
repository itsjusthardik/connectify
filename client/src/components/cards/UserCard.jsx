import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

/**
 * UserCard Component
 * Individual user profile card for browse view
 * Shows name, role, bio, hourly rate, and connect action
 */
export const UserCard = ({ user, onConnect }) => {
  const getRoleBadgeColor = (role) => {
    const colors = {
      'Content Creator': 'text-primary',
      'Video Editor': 'text-secondary',
      'Graphic Designer': 'text-cyan',
      'Consumer': 'text-success',
      'Other': 'text-warning',
    };
    return colors[role] || 'text-primary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 rounded-lg border border-border-color hover:border-primary transition-all"
    >
      {/* Avatar */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">
          {user.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg mb-1">{user.name}</h3>
        <p className={`text-sm font-semibold mb-2 capitalize ${getRoleBadgeColor(user.role)}`}>
          {user.role.replace(/_/g, ' ')}
        </p>
        <p className="text-text-secondary text-sm line-clamp-2 mb-2">
          {user.bio || 'No bio provided'}
        </p>

        {/* Hourly Rate Badge */}
        {['Content Creator','Video Editor','Graphic Designer'].includes(user.role) && user.hourlyRate > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '8px',
            padding: '0.2rem 0.6rem',
            fontSize: '0.82rem',
            color: '#10B981',
            fontWeight: 600,
            margin: '0.5rem 0'
          }}>
            ₹{user.hourlyRate}/hr
          </div>
        )}

        {/* Niches/Tags */}
        {user.niche && user.niche.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {user.niche.slice(0, 2).map((niche) => (
              <span key={niche} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                {niche}
              </span>
            ))}
            {user.niche.length > 2 && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                +{user.niche.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onConnect?.(user._id)}
          className="w-full px-4 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary/90 transition-all"
        >
          Connect
        </motion.button>
        <Link
          to={`/profile/${user._id}`}
          className="block w-full px-4 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-all text-center"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
};

export default UserCard;
