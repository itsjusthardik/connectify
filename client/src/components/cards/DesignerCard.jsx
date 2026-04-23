import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ExternalLink, MessageSquare } from 'lucide-react';

/**
 * DesignerCard Component
 * Displays graphic designer with skills, rate, experience, portfolio
 * Same structure as EditorCard (both are talent)
 */
export const DesignerCard = ({ designer, onSendConnect }) => {
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
          src={designer.profileImage || 'https://via.placeholder.com/300x200'}
          alt={designer.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-bold text-lg font-display mb-1 truncate">
          {designer.name}
        </h3>

        {/* Skills */}
        {designer.skills && designer.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {designer.skills.slice(0, 2).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
            {designer.skills.length > 2 && (
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                +{designer.skills.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Rate & Experience */}
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-1">
            <span className="text-secondary font-semibold">
              ${designer.hourlyRate || 0}/hr
            </span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span>{designer.experienceYears || 0} yrs</span>
          </div>
        </div>

        {/* Portfolio Links */}
        {designer.portfolioLinks && designer.portfolioLinks.length > 0 && (
          <div className="mb-3 pb-3 border-b border-border-color">
            <div className="flex gap-2">
              {designer.portfolioLinks.slice(0, 2).map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                  Portfolio
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/profile/${designer._id}`}
            className="flex-1 px-3 py-2 border border-primary rounded-lg hover:bg-primary/10 transition-colors text-center text-sm font-medium text-primary"
          >
            View Profile
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSendConnect(designer._id)}
            className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-center text-sm font-medium flex items-center justify-center gap-1"
          >
            <MessageSquare size={16} />
            Connect
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DesignerCard;
