/**
 * LockScreen.jsx
 * 
 * Secure unlock screen shown when wallet is locked or browser session resumes.
 * Prompts user for master password to decrypt AES-encrypted wallet in memory.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BsHexagonFill } from 'react-icons/bs';
import { FiLock, FiAlertTriangle, FiUnlock, FiTrash2 } from 'react-icons/fi';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import showToast from './Toast';
import { useWallet } from '../context';
import { shortenAddress } from '../utils/mockData';

function LockScreen({ onUnlocked = () => {} }) {
  const { address, unlockWallet, resetWallet } = useWallet();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required to unlock your wallet.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await unlockWallet(password);
      showToast.success('Wallet unlocked successfully!');
      onUnlocked();
    } catch (err) {
      console.warn('Unlock attempt failed:', err.message);
      setError('Wrong Password');
      showToast.error('Wrong Password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = () => {
    resetWallet();
    setShowResetModal(false);
    showToast.info('Wallet data cleared. You can now create or import a new wallet.');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <Card className="p-4 p-md-5 text-center">
          {/* Brand Logo & Header */}
          <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'rgba(255, 107, 0, 0.12)', border: '1px solid var(--glass-border-orange)' }}>
            <div className="brand-emblem" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
              <BsHexagonFill />
            </div>
          </div>

          <h3 className="fw-bold mb-1">
            Unlock <span className="text-gradient">EtherVault</span>
          </h3>
          <p className="text-muted small mb-4 font-mono">
            {address ? `Account: ${shortenAddress(address, 6)}` : 'Enter master password to access your assets'}
          </p>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-danger p-3 mb-4 rounded-3 d-flex align-items-center justify-content-center gap-2 font-mono small"
              style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#F43F5E' }}
            >
              <FiAlertTriangle className="fs-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleUnlock}>
            <div className="mb-4 text-start">
              <Input
                label="Master Password"
                type="password"
                placeholder="Enter your wallet password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                icon={<FiLock className="text-orange" />}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-100 mb-3"
              loading={loading}
              disabled={loading || !password}
              icon={<FiUnlock className="fs-5" />}
            >
              {loading ? 'Decrypting Vault...' : 'Unlock Wallet'}
            </Button>
          </form>

          {/* Reset / Forgot Option */}
          <div className="pt-3 border-top border-white border-opacity-10">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="btn btn-link text-dim text-decoration-none small font-mono p-0"
              style={{ fontSize: '0.85rem' }}
            >
              Forgot password? Reset wallet
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content vault-modal-content">
              <div className="modal-header border-bottom border-danger border-opacity-25 p-4">
                <h5 className="modal-title fw-bold text-danger">
                  <FiAlertTriangle className="me-2" /> Reset Local Wallet
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-vault-glass"
                  onClick={() => setShowResetModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="text-muted mb-4">
                  Resetting your wallet will erase the encrypted keystore from this device. You will need your 12-word recovery phrase to restore your assets.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Button variant="glass" onClick={() => setShowResetModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleConfirmReset} icon={<FiTrash2 />}>
                    Erase & Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1065 }} onClick={() => setShowResetModal(false)}></div>
        </div>
      )}
    </div>
  );
}

export default LockScreen;
