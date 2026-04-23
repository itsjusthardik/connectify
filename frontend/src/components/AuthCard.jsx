import React from 'react';
import { motion } from 'framer-motion';

export const AuthCard = ({ children, title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/50 rounded-2xl p-8 shadow-2xl hover:shadow-violet hover:shadow-lg transition-shadow duration-300">
        {/* Logo */}
        <motion.div
          className="flex justify-center items-center gap-2 mb-8"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet to-blue" />
          <span className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-violet via-blue to-violet">
            Connectify
          </span>
        </motion.div>

        {/* Title */}
        {title && (
          <h1 className="text-2xl font-bold text-center mb-6 font-display text-white">
            {title}
          </h1>
        )}

        {/* Content */}
        <div className="space-y-4">{children}</div>
      </div>
    </motion.div>
  );
};
