import React from 'react';
import { motion } from 'framer-motion';

/**
 * SkeletonCard Component
 * Loading placeholder card with shimmer animation
 */
export const SkeletonCard = () => {
  const shimmer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'mirror',
      },
    },
  };

  return (
    <motion.div
      variants={shimmer}
      initial="hidden"
      animate="visible"
      className="glass-card p-6 rounded-lg border border-border-color"
    >
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-dark/50 animate-pulse" />
        </div>

        {/* Text lines */}
        <div className="space-y-2">
          <div className="h-6 bg-dark/50 rounded-lg animate-pulse" />
          <div className="h-4 bg-dark/50 rounded-lg animate-pulse w-3/4 mx-auto" />
        </div>

        {/* Button */}
        <div className="h-10 bg-dark/50 rounded-lg animate-pulse w-full" />
      </div>
    </motion.div>
  );
};

export default SkeletonCard;
