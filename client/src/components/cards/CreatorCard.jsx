import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, MessageSquare } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';

/**
 * CreatorCard Component
 * Displays creator with niche, followers, bio
 * Used in BrowseCreators page by consumers
 */
export const CreatorCard = ({ creator, onRequestCollaboration }) => {
  const cardVariants = {
    rest: { y: 0 },
    hover: { y: -5 },
  };

  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      className="glass-card rounded-lg overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-dark/50">
        <motion.img
          variants={imageVariants}
          src={creator.profileImage || 'https://via.placeholder.com/300x200'}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-bold text-lg font-display mb-1 truncate">
          {creator.name}
        </h3>

        {/* Niche */}
        {creator.niche && creator.niche.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {creator.niche.slice(0, 2).map((n) => (
              <span
                key={n}
                className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
              >
                {n}
              </span>
            ))}
            {creator.niche.length > 2 && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                +{creator.niche.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Followers */}
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-3">
          <Users size={16} className="text-secondary" />
          <span>{creator.followersCount?.toLocaleString() || 0} followers</span>
        </div>

        {/* Bio */}
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {creator.bio || 'No bio added yet'}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/profile/${creator._id}`}
            className="flex-1 px-3 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-center text-sm font-medium"
          >
            View Profile
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRequestCollaboration(creator._id)}
            className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-center text-sm font-medium flex items-center justify-center gap-1"
          >
            <MessageSquare size={16} />
            Request
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CreatorCard;
