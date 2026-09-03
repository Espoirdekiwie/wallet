import React from 'react';
import { motion } from 'framer-motion';

function Card({
  children,
  variant = 'default',
  className = '',
  animate = true,
  ...props
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'orange': return 'border-orange';
      case 'purple': return 'border-purple';
      default: return '';
    }
  };

  const Component = animate ? motion.div : 'div';
  const motionProps = animate ? {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] }
  } : {};

  return (
    <Component
      className={`glass-card ${getVariantClass()} ${className}`}
      {...motionProps}
      {...props}
    >
      <div className="card-body p-4">
        {children}
      </div>
    </Component>
  );
}

export default Card;
