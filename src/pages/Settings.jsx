import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSettings, 
  FiShield, 
  FiKey, 
  FiLock, 
  FiGlobe, 
  FiTrash2, 
  FiCheck, 
  FiAlertTriangle,
  FiX,
  FiCopy,
  FiMoon,
  FiSun,
  FiUnlock
} from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';
import { BsHexagonFill, BsShieldCheck } from 'react-icons/bs';

import { 
  Navbar, 
  Sidebar, 
  Card, 
  Button, 
  Input, 
  NetworkModal,
  LockScreen,
  showToast 
} from '../components';
import { mockWallet } from '../utils/mockData';
import { useWallet, useTheme } from '../context';
import { decryptWallet } from '../services/encryption';

function Settings() {
  const navigate = useNavigate();
  const { address, isUnlocked, isInitialized, resetWallet, changeUserPassword } = useWallet();
  const { isDarkMode, toggleTheme } = useTheme();
  const activeAddress = address || mockWallet.address;

  const [selectedNetwork, setSelectedNetwork] = useState('sepolia');
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isRevealPhraseOpen, setIsRevealPhraseOpen] = useState(false);
  const [isExportKeyOpen, setIsExportKeyOpen] = useState(false);
  const [isClearWalletModalOpen, setIsClearWalletModalOpen] = useState(false);
  
  // Decryption credentials state
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [decryptedData, setDecryptedData] = useState(null);
  const [copiedPhrase, setCopiedPhrase] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Handle Theme Toggle
  const handleToggleTheme = () => {
    toggleTheme();
    showToast.info(!isDarkMode ? 'Dark Mode enabled' : 'Cyber Light Mode enabled');
  };

  // PART 9: Change Password & Re-encrypt Wallet
  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      changeUserPassword(currentPassword, newPassword);
      showToast.success('Password updated & wallet re-encrypted successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (err) {
      console.warn('Password change error:', err.message);
      setPasswordError('Wrong current password. Re-encryption failed.');
      showToast.error('Wrong current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // PART 10: Unlock credentials check (Reveal Phrase / Export Private Key)
  const handleUnlockKeys = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!authPassword) {
      setAuthError('Password is required.');
      return;
    }

    try {
      const decrypted = decryptWallet(null, authPassword);
      setDecryptedData(decrypted);
      setAuthError('');
      showToast.success('Credentials decrypted successfully.');
    } catch (err) {
      console.warn('Decryption error:', err.message);
      setAuthError('Wrong Password');
      showToast.error('Wrong Password. Please try again.');
    }
  };

  const handleCopyPhrase = () => {
    const phrase = decryptedData?.mnemonic || mockWallet.mnemonic;
    navigator.clipboard.writeText(phrase);
    setCopiedPhrase(true);
    showToast.success('Recovery phrase copied!');
    setTimeout(() => setCopiedPhrase(false), 2000);
  };

  const handleCopyKey = () => {
    const key = decryptedData?.privateKey || '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f360f21';
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    showToast.success('Private key copied!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Clear Wallet Data & Return Home
  const handleConfirmClearWallet = () => {
    resetWallet();
    try {
      localStorage.removeItem('ethervault_transactions_v1');
      localStorage.removeItem('ethervault_active_address');
    } catch (e) {
      console.warn('Error clearing local storage items:', e);
    }
    setIsClearWalletModalOpen(false);
    showToast.info('Local wallet data deleted successfully.');
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
  };

  // If local wallet exists but session is locked, show LockScreen
  if (isInitialized && !isUnlocked) {
    return <LockScreen />;
  }

  return (
    <>
      <Navbar
        walletAddress={activeAddress}
        network="Ethereum Sepolia"
        onNetworkClick={() => setIsNetworkModalOpen(true)}
        onMobileMenuClick={() => setIsMobileNavOpen(true)}
      />

      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <div className="container-fluid px-lg-4 py-4">
        <div className="row justify-content-center">
          {/* Settings Main Content */}
          <div className="col-12 col-xl-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Header */}
              <motion.div variants={itemVariants} className="mb-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <h2 className="fw-bold mb-0">
                      <FiSettings className="text-orange me-2" /> Settings & <span className="text-gradient">Security</span>
                    </h2>
                    <p className="text-muted small mb-0 mt-1">
                      Manage wallet encryption, appearance, network preferences, and security credentials.
                    </p>
                  </div>
                  <div className="version-pill">
                    <BsShieldCheck className="text-orange" />
                    <span>Version 1.0</span>
                  </div>
                </div>
              </motion.div>

              {/* 1. Theme & Appearance (Dark Mode Toggle) */}
              <motion.div variants={itemVariants}>
                <Card className="mb-4">
                  <div className="settings-section-title text-white">
                    <FiMoon className="text-purple fs-5" /> Theme & Appearance
                  </div>

                  <div className="glass-panel p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          background: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                          border: `1px solid ${isDarkMode ? 'var(--glass-border-purple)' : 'var(--glass-border-orange)'}`
                        }}
                      >
                        {isDarkMode ? (
                          <FiMoon className="fs-4 text-purple" />
                        ) : (
                          <FiSun className="fs-4 text-orange" />
                        )}
                      </div>
                      <div>
                        <div className="fw-bold text-white mb-0">Dark Mode</div>
                        <div className="small text-muted font-mono">
                          {isDarkMode ? 'Obsidian Glassmorphism (Default)' : 'Cyber Glow Mode'}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <span className="badge bg-purple bg-opacity-25 text-purple-light font-mono d-none d-sm-inline-block">
                        {isDarkMode ? 'Dark Mode: Active' : 'Light Mode: Active'}
                      </span>
                      <div className="form-check form-switch fs-3 mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="themeSwitch"
                          checked={isDarkMode}
                          onChange={handleToggleTheme}
                          aria-label="Toggle Dark Mode"
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isDarkMode ? 'var(--orange)' : undefined,
                            borderColor: isDarkMode ? 'var(--orange)' : undefined
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 2. Change Password & Re-Encrypt Wallet */}
              <motion.div variants={itemVariants}>
                <Card className="mb-4">
                  <div className="settings-section-title text-white">
                    <FiLock className="text-orange fs-5" /> Change Password
                  </div>
                  <p className="text-muted small mb-3">
                    Verify your current password and re-encrypt your wallet with a new master password.
                  </p>

                  {passwordError && (
                    <div className="alert alert-danger p-3 mb-3 rounded-3 d-flex align-items-center gap-2 font-mono small" style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#F43F5E' }}>
                      <FiAlertTriangle className="fs-5 flex-shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePasswordSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-md-4 col-12">
                        <Input
                          label="Current Password"
                          type="password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          required
                        />
                      </div>
                      <div className="col-md-4 col-12">
                        <Input
                          label="New Password"
                          type="password"
                          placeholder="Min 8 characters"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          required
                        />
                      </div>
                      <div className="col-md-4 col-12">
                        <Input
                          label="Confirm New Password"
                          type="password"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={passwordLoading}
                      disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                      icon={<FiLock className="fs-5" />}
                    >
                      {passwordLoading ? 'Re-encrypting Wallet...' : 'Update Password & Re-Encrypt'}
                    </Button>
                  </form>
                </Card>
              </motion.div>

              {/* 3. Blockchain Network Settings */}
              <motion.div variants={itemVariants}>
                <Card className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <div className="settings-section-title text-white mb-0">
                      <FiGlobe className="text-orange fs-5" /> Blockchain Network
                    </div>
                    <Button
                      variant="outline-orange"
                      size="sm"
                      onClick={() => setIsNetworkModalOpen(true)}
                    >
                      Switch Network
                    </Button>
                  </div>

                  <div className="glass-panel p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                      <div className="brand-emblem" style={{ width: '38px', height: '38px' }}>
                        <FaEthereum />
                      </div>
                      <div>
                        <div className="fw-bold text-white">
                          Ethereum Sepolia Testnet
                        </div>
                        <div className="small text-dim font-mono">Chain ID: 11155111 · RPC Connected</div>
                      </div>
                    </div>
                    <span className="badge bg-success bg-opacity-25 text-success font-mono">
                      <span className="status-dot-pulse me-1" style={{ width: '6px', height: '6px' }}></span> Active
                    </span>
                  </div>
                </Card>
              </motion.div>

              {/* 4. Security & Key Credentials (Export Phrase & Private Key) */}
              <motion.div variants={itemVariants}>
                <Card className="mb-4">
                  <div className="settings-section-title text-white">
                    <FiShield className="text-purple fs-5" /> Secret Key Backup & Credentials
                  </div>
                  <p className="text-muted small mb-3">
                    Safeguard and decrypt your cryptographic keys offline for safe storage.
                  </p>

                  <div className="d-flex flex-column gap-3">
                    <div className="glass-panel p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <div className="fw-bold text-white mb-0">12-Word Secret Recovery Phrase</div>
                        <div className="small text-muted font-mono">BIP39 HD seed phrase for master account restore</div>
                      </div>
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => {
                          setDecryptedData(null);
                          setAuthPassword('');
                          setAuthError('');
                          setIsRevealPhraseOpen(true);
                        }}
                        icon={<FiKey className="text-purple" />}
                      >
                        Reveal Phrase
                      </Button>
                    </div>

                    <div className="glass-panel p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <div className="fw-bold text-white mb-0">Export Private Key (Hex)</div>
                        <div className="small text-muted font-mono">Raw 256-bit elliptic curve ECDSA private key</div>
                      </div>
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => {
                          setDecryptedData(null);
                          setAuthPassword('');
                          setAuthError('');
                          setIsExportKeyOpen(true);
                        }}
                        icon={<FiLock className="text-orange" />}
                      >
                        Export Key
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 5. About EtherVault & Version 1.0 */}
              <motion.div variants={itemVariants}>
                <Card className="mb-4">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="brand-emblem" style={{ width: '48px', height: '48px', fontSize: '1.6rem' }}>
                        <BsHexagonFill />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">
                          About Ether<span className="text-gradient">Vault</span>
                        </h4>
                        <div className="small text-muted font-mono">Non-Custodial Web3 Ethereum Gateway</div>
                      </div>
                    </div>

                    <div className="version-pill">
                      <span className="text-muted">Version:</span>
                      <strong className="text-orange">1.0</strong>
                    </div>
                  </div>

                  <p className="text-muted small mb-3" style={{ lineHeight: '1.7' }}>
                    EtherVault is a modern, client-side encrypted cryptocurrency wallet engineered with React, Ethers.js v6, crypto-js AES encryption, and Framer Motion. Your cryptographic keys never touch external servers and are stored strictly in AES-encrypted format.
                  </p>

                  <div className="glass-panel p-3">
                    <div className="row g-3 font-mono small">
                      <div className="col-sm-6 col-12 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-2">
                        <span className="text-muted">Application Version:</span>
                        <span className="text-orange fw-bold">Version 1.0</span>
                      </div>
                      <div className="col-sm-6 col-12 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-2">
                        <span className="text-muted">Build Status:</span>
                        <span className="badge bg-success bg-opacity-25 text-success">v1.0.0 (Production)</span>
                      </div>
                      <div className="col-sm-6 col-12 d-flex justify-content-between align-items-center">
                        <span className="text-muted">Cryptographic Core:</span>
                        <span className="text-purple-light fw-bold">Ethers.js v6 · BIP39</span>
                      </div>
                      <div className="col-sm-6 col-12 d-flex justify-content-between align-items-center">
                        <span className="text-muted">Storage Encryption:</span>
                        <span className="text-success fw-bold">AES-256 (CryptoJS)</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 6. Danger Zone: Clear Wallet Data */}
              <motion.div variants={itemVariants}>
                <Card className="danger-zone-card">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                      <h5 className="fw-bold text-danger mb-1 d-flex align-items-center gap-2">
                        <FiAlertTriangle /> Clear Wallet Data
                      </h5>
                      <p className="text-muted small mb-0">
                        Permanently delete local encrypted keystore and transaction history from this browser.
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => setIsClearWalletModalOpen(true)}
                      icon={<FiTrash2 />}
                    >
                      Clear Wallet
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Network Modal */}
      <NetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        selectedNetwork={selectedNetwork}
        onSelectNetwork={(net) => {
          setSelectedNetwork(net.id);
          showToast.success(`Switched to ${net.name}`);
        }}
      />

      {/* Clear Wallet Confirmation Dialog Modal */}
      {isClearWalletModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1065 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content vault-modal-content">
              <div className="modal-header border-bottom border-danger border-opacity-25 p-4">
                <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                  <FiAlertTriangle /> Clear Wallet Confirmation
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-vault-glass"
                  onClick={() => setIsClearWalletModalOpen(false)}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-body p-4 text-center">
                <div
                  className="d-inline-flex p-3 rounded-circle mb-3"
                  style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)' }}
                >
                  <FiTrash2 className="fs-1 text-danger" />
                </div>
                <h5 className="fw-bold text-white mb-2">Are you sure you want to delete this wallet?</h5>
                <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>
                  This action will <strong>permanently erase</strong> your local encrypted keystore and activity history from this browser session. Ensure you have your 12-word recovery phrase backed up offline before proceeding.
                </p>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Button variant="glass" onClick={() => setIsClearWalletModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleConfirmClearWallet} icon={<FiTrash2 />}>
                    Yes, Delete Wallet & Return Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1060 }} onClick={() => setIsClearWalletModalOpen(false)}></div>
        </div>
      )}

      {/* Reveal Phrase Modal (PART 10) */}
      {isRevealPhraseOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1065 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content vault-modal-content">
              <div className="modal-header border-bottom border-white border-opacity-10 p-4">
                <h5 className="modal-title fw-bold text-purple">
                  <FiKey className="me-2" /> Secret Recovery Phrase
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-vault-glass"
                  onClick={() => setIsRevealPhraseOpen(false)}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-body p-4">
                {/* Warning Banner */}
                <div className="alert alert-danger small mb-3 rounded-3 d-flex align-items-center gap-2" style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#F43F5E' }}>
                  <FiAlertTriangle className="fs-4 flex-shrink-0" />
                  <span><strong>Warning:</strong> Never share this information. Anyone with this phrase can steal your funds.</span>
                </div>

                {!decryptedData ? (
                  <form onSubmit={handleUnlockKeys}>
                    {authError && (
                      <div className="small text-danger font-mono mb-2">
                        <FiAlertTriangle className="me-1" /> {authError}
                      </div>
                    )}
                    <div className="mb-3">
                      <Input
                        label="Master Password"
                        type="password"
                        placeholder="Enter master password"
                        value={authPassword}
                        onChange={(e) => {
                          setAuthPassword(e.target.value);
                          if (authError) setAuthError('');
                        }}
                        icon={<FiLock className="text-purple" />}
                        required
                        autoFocus
                      />
                    </div>
                    <Button type="submit" variant="primary" className="w-100" icon={<FiUnlock />}>
                      Decrypt Recovery Phrase
                    </Button>
                  </form>
                ) : (
                  <div>
                    <div className="p-3 rounded-3 font-mono text-purple small text-break mb-3 bg-dark bg-opacity-75 border border-purple">
                      {decryptedData.mnemonic || 'No mnemonic phrase stored with this account.'}
                    </div>
                    {decryptedData.mnemonic && (
                      <Button
                        variant="outline-purple"
                        className="w-100 font-mono"
                        onClick={handleCopyPhrase}
                        icon={copiedPhrase ? <FiCheck className="text-success" /> : <FiCopy />}
                      >
                        {copiedPhrase ? 'Copied to Clipboard!' : 'Copy 12 Words'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1060 }} onClick={() => setIsRevealPhraseOpen(false)}></div>
        </div>
      )}

      {/* Export Private Key Modal (PART 10) */}
      {isExportKeyOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1065 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content vault-modal-content">
              <div className="modal-header border-bottom border-white border-opacity-10 p-4">
                <h5 className="modal-title fw-bold text-orange">
                  <FiLock className="me-2" /> Export Private Key (Hex)
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-vault-glass"
                  onClick={() => setIsExportKeyOpen(false)}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-body p-4">
                {/* Warning Banner */}
                <div className="alert alert-danger small mb-3 rounded-3 d-flex align-items-center gap-2" style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#F43F5E' }}>
                  <FiAlertTriangle className="fs-4 flex-shrink-0" />
                  <span><strong>Warning:</strong> Never share this information. Anyone with this key has full control over your assets.</span>
                </div>

                {!decryptedData ? (
                  <form onSubmit={handleUnlockKeys}>
                    {authError && (
                      <div className="small text-danger font-mono mb-2">
                        <FiAlertTriangle className="me-1" /> {authError}
                      </div>
                    )}
                    <div className="mb-3">
                      <Input
                        label="Master Password"
                        type="password"
                        placeholder="Enter master password"
                        value={authPassword}
                        onChange={(e) => {
                          setAuthPassword(e.target.value);
                          if (authError) setAuthError('');
                        }}
                        icon={<FiLock className="text-orange" />}
                        required
                        autoFocus
                      />
                    </div>
                    <Button type="submit" variant="primary" className="w-100" icon={<FiUnlock />}>
                      Decrypt Private Key
                    </Button>
                  </form>
                ) : (
                  <div>
                    <div className="p-3 rounded-3 font-mono text-danger small text-break mb-3 bg-dark bg-opacity-75 border border-danger">
                      {decryptedData.privateKey}
                    </div>
                    <Button
                      variant="outline-orange"
                      className="w-100 font-mono"
                      onClick={handleCopyKey}
                      icon={copiedKey ? <FiCheck className="text-success" /> : <FiCopy />}
                    >
                      {copiedKey ? 'Copied Private Key!' : 'Copy Private Key'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1060 }} onClick={() => setIsExportKeyOpen(false)}></div>
        </div>
      )}
    </>
  );
}

export default Settings;
