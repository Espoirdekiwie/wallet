import React from 'react';
import { motion } from 'framer-motion';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  icon = null,
  ...props
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-vault-primary';
      case 'orange': return 'btn-vault-orange';
      case 'purple': return 'btn-vault-purple';
      case 'glass': return 'btn-vault-glass';
      case 'outline-orange': return 'btn-vault-outline-orange';
      case 'outline-purple': return 'btn-vault-outline-purple';
      case 'danger': return 'btn btn-outline-danger';
      default: return 'btn-vault-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'btn-sm py-1 px-3 fs-6';
      case 'lg': return 'btn-lg py-3 px-4 fs-5';
      default: return '';
    }
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${getVariantClass()} ${getSizeClass()} ${className} d-inline-flex align-items-center justify-content-center gap-2`}
      {...props}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      ) : (
        icon && <span className="d-inline-flex">{icon}</span>
      )}
      <span>{children}</span>
    </motion.button>
  );
}

export default Button;
