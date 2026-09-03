import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiDownload, 
  FiKey, 
  FiLock, 
  FiShield, 
  FiAlertTriangle, 
  FiArrowRight, 
  FiArrowLeft, 
  FiClipboard 
} from 'react-icons/fi';
import { Button, Input, Card, showToast } from '../components';
import { useWallet } from '../context';
import walletService from '../services/walletService';

function ImportWallet() {
  const navigate = useNavigate();
  const { importWallet } = useWallet();

  const [phrase, setPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phraseError, setPhraseError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState('');

  const cleanPhrase = phrase.trim().replace(/\s+/g, ' ');
  const words = cleanPhrase ? cleanPhrase.split(' ') : [];
  const wordCount = cleanPhrase ? words.length : 0;
  const isPhraseValid = wordCount === 12 && walletService.isValidMnemonic(cleanPhrase);

  // Password strength scoring
  const getStrengthScore = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = getStrengthScore(password);
  const strengthDetails = [
    { label: 'Enter a password...', width: '0%', color: 'transparent', textClass: 'text-dim' },
    { label: 'Weak (add numbers & symbols)', width: '33%', color: 'var(--danger)', textClass: 'text-danger' },
    { label: 'Medium (add uppercase letters)', width: '66%', color: 'var(--orange)', textClass: 'text-orange' },
    { label: 'Strong crypto security!', width: '100%', color: 'var(--green)', textClass: 'text-success' }
  ];

  const currentStrength = strengthDetails[strengthScore];
  const isMatch = password && confirmPassword && password === confirmPassword;
  const isMismatch = confirmPassword && password !== confirmPassword;
  const isPasswordValid = password.length >= 8 && isMatch;

  // Paste from clipboard handler
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPhrase(text.trim());
        setPhraseError(null);
        showToast.info('Phrase pasted from clipboard');
      }
    } catch {
      showToast.info('Paste clipboard text directly into the textarea');
    }
  };

  // Live validation on phrase change
  const handlePhraseChange = (e) => {
    const val = e.target.value;
    setPhrase(val);
    setPhraseError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Mnemonic using ethers.js
    if (!walletService.isValidMnemonic(cleanPhrase)) {
      setPhraseError('Invalid 12-word BIP39 recovery phrase. Please check word spelling and order.');
      showToast.error('Invalid recovery phrase. Please verify the 12 words.');
      return;
    }

    // 2. Validate Password
    if (!isPasswordValid) {
      showToast.error('Please enter matching passwords with at least 8 characters.');
      return;
    }

    setLoading(true);
    setEncryptionProgress('Validating recovery phrase and encrypting wallet with AES...');

    try {
      // 3. Encrypt wallet with password and save AES ciphertext locally
      await importWallet(cleanPhrase, password);

      showToast.success('Wallet restored, encrypted with AES, and loaded into session!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Wallet import error:', error);
      setPhraseError(error.message || 'Failed to import wallet.');
      showToast.error(error.message || 'Failed to restore wallet.');
    } finally {
      setLoading(false);
      setEncryptionProgress('');
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-9 col-12">
          <Card>
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex p-3 rounded-circle mb-3"
                style={{
                  background: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid var(--glass-border-purple)',
                  boxShadow: '0 0 25px var(--purple-glow)'
                }}
              >
                <FiDownload className="text-purple fs-2" />
              </div>
              <h2 className="fw-bold mb-1">Import Existing Wallet</h2>
              <p className="text-muted small">
                Restore your account using your 12-word BIP39 secret recovery phrase.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: 12-Word Recovery Phrase Input */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="vault-label mb-0">
                    <FiKey className="text-orange me-1" /> 12-Word Secret Recovery Phrase
                  </label>
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="btn btn-sm btn-vault-glass py-0 px-2 font-mono small text-orange d-inline-flex align-items-center gap-1"
                  >
                    <FiClipboard /> Paste
                  </button>
                </div>

                <textarea
                  className={`form-control vault-input vault-input-mono ${
                    phraseError ? 'is-invalid border-danger' : isPhraseValid ? 'border-success' : ''
                  }`}
                  rows="3"
                  placeholder="Enter your 12 words separated by spaces (e.g. apple banana cherry...)"
                  value={phrase}
                  onChange={handlePhraseChange}
                  disabled={loading}
                  required
                  style={{ lineHeight: 1.8 }}
                ></textarea>

                {/* Live Word Counter & Validation Pill */}
                <div className="d-flex justify-content-between align-items-center mt-2 font-mono small">
                  <span className={wordCount === 12 ? (isPhraseValid ? 'text-success fw-bold' : 'text-danger fw-bold') : 'text-dim'}>
                    {wordCount} / 12 words {isPhraseValid && '✓ Valid BIP39'}
                  </span>
                  <span className="text-dim">BIP39 Standard</span>
                </div>

                {/* Error Display if invalid */}
                {phraseError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-danger py-2 px-3 mt-3 d-flex align-items-center gap-2 rounded-3 small font-mono"
                    style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)' }}
                  >
                    <FiAlertTriangle className="text-danger fs-5 flex-shrink-0" />
                    <span>{phraseError}</span>
                  </motion.div>
                )}
              </div>

              {/* Step 2: Create Session Password (shown progressively or as full form) */}
              <div className="pt-3 border-top border-white border-opacity-10 mb-4">
                <h5 className="fw-bold text-white mb-1">
                  <FiLock className="text-purple me-1" /> Create Session Password
                </h5>
                <p className="text-muted small mb-3">
                  This password encrypts your imported credentials locally into a secure Keystore JSON.
                </p>

                {/* New Password */}
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<FiLock className="text-orange" />}
                  disabled={loading}
                  required
                />

                {/* Strength Meter */}
                <div className="mb-3">
                  <div className="strength-track">
                    <motion.div
                      className="strength-bar"
                      animate={{
                        width: currentStrength.width,
                        backgroundColor: currentStrength.color
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1 font-mono small">
                    <span className={currentStrength.textClass}>{currentStrength.label}</span>
                    <span className="text-dim">Min 8 chars</span>
                  </div>
                </div>

                {/* Confirm Password */}
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<FiShield className="text-purple" />}
                  error={isMismatch ? 'Passwords do not match' : null}
                  helperText={isMatch ? '✓ Passwords match' : null}
                  disabled={loading}
                  required
                />
              </div>

              {/* Encryption Progress Indicator */}
              {encryptionProgress && (
                <div className="text-center font-mono small text-orange mb-3 animate-pulse">
                  <FiLock className="me-1" />
                  {encryptionProgress}
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={!isPhraseValid || !isPasswordValid || loading}
                  icon={<FiArrowRight />}
                >
                  {loading ? 'Encrypting & Importing...' : 'Import & Open Vault'}
                </Button>

                <Link to="/" className="text-decoration-none">
                  <Button variant="glass" size="md" className="w-100" disabled={loading} icon={<FiArrowLeft />}>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ImportWallet;
