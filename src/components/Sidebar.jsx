import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGrid, 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiClock, 
  FiSettings, 
  FiZap,
  FiX
} from 'react-icons/fi';
import { BsHexagonFill } from 'react-icons/bs';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { path: '/send', label: 'Send Assets', icon: FiArrowUpRight },
  { path: '/receive', label: 'Receive Assets', icon: FiArrowDownLeft },
  { path: '/transactions', label: 'Activity History', icon: FiClock },
  { path: '/settings', label: 'Settings & Security', icon: FiSettings },
];

function Sidebar({ isOpen = false, onClose = () => {} }) {
  // Listen for Escape key to close the drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="vault-drawer-backdrop"
            onClick={onClose}
            aria-label="Close navigation overlay"
          />

          {/* Slide-out Drawer Panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="vault-drawer d-flex flex-column justify-content-between"
            aria-label="Main Navigation Drawer"
          >
            {/* Header */}
            <div>
              <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-white border-opacity-10">
                <div className="d-flex align-items-center gap-2">
                  <div className="brand-emblem" style={{ width: '34px', height: '34px', fontSize: '1.1rem' }}>
                    <BsHexagonFill />
                  </div>
                  <span className="brand-title" style={{ fontSize: '1.25rem' }}>
                    Ether<span className="text-gradient">Vault</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-vault-glass p-2 d-flex align-items-center justify-content-center"
                  onClick={onClose}
                  aria-label="Close Sidebar"
                  style={{ width: '32px', height: '32px' }}
                >
                  <FiX className="fs-5" />
                </button>
              </div>

              {/* Navigation Menu */}
              <div className="small fw-bold text-muted text-uppercase mb-2 px-2 font-mono">
                Menu
              </div>
              <ul className="sidebar-nav">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? 'active' : ''}`
                        }
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Bottom Gas & Info Widget */}
            <div>
              <hr className="gradient-divider my-3" />
              <div className="gas-tracker-widget">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted d-flex align-items-center gap-1 font-mono">
                    <FiZap className="text-orange" /> Gas Price
                  </span>
                  <span className="badge bg-success bg-opacity-25 text-success font-mono">
                    18 Gwei
                  </span>
                </div>
                <div className="small text-dim font-mono">Ethereum Mainnet · Fast ~12s</div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;
