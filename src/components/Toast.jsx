import { toast } from 'react-toastify';

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      icon: '✨',
      ...options
    });
  },
  error: (message, options = {}) => {
    toast.error(message, {
      icon: '⚠️',
      ...options
    });
  },
  info: (message, options = {}) => {
    toast.info(message, {
      icon: '🪐',
      ...options
    });
  },
  warning: (message, options = {}) => {
    toast.warning(message, {
      icon: '🛡️',
      ...options
    });
  }
};

export default showToast;
