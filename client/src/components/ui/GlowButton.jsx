import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlowButton Component
 * Gradient background with glow effect
 * Scales on hover, animates disabled state
 * Supports loading with spinner
 */
export const GlowButton = React.forwardRef(
  (
    {
      children,
      onClick,
      disabled = false,
      loading = false,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const variantClasses = {
      primary: 'bg-gradient-to-r from-primary to-primary/70 hover:to-primary/60',
      secondary: 'bg-gradient-to-r from-secondary to-secondary/70 hover:to-secondary/60',
      outline: 'border-2 border-primary hover:bg-primary/10',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.03 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        className={`glow-button ${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          fullWidth ? 'w-full' : ''
        } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        {...props}
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
            />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

GlowButton.displayName = 'GlowButton';

export default GlowButton;
