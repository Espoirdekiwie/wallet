import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiShield, FiAlertTriangle, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { Button, Input, Card, showToast } from '../components';
import { useWallet } from '../context';

function CreatePassword() {
  const navigate = useNavigate();
  const { prepareNewWallet } = useWallet();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  // Calculate password strength score (0-3)
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
  const canProceed = password.length >= 8 && isMatch && acknowledged;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canProceed) return;

    try {
      // Prepares random HD wallet using ethers.Wallet.createRandom()
      prepareNewWallet(password);
      showToast.success('Password set! Please record your recovery phrase.');
      navigate('/recovery-phrase');
    } catch (error) {
      console.error('Wallet preparation error:', error);
      showToast.error(error.message || 'Failed to initialize wallet.');
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8 col-12">
          <Card>
            {/* Step Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-warning bg-opacity-10 text-orange font-mono px-3 py-1 rounded-pill">
                Step 1 of 3
              </span>
              <span className="small text-muted font-mono">Password Setup</span>
            </div>

            {/* Stepper Progress */}
            <div className="strength-track mb-4" style={{ height: '4px' }}>
              <div className="strength-bar" style={{ width: '33%', background: 'var(--gradient-primary)' }}></div>
            </div>

            <h2 className="fw-bold mb-1">Protect Your Vault</h2>
            <p className="text-muted small mb-4">Set a strong session password to encrypt your local wallet credentials.</p>

            <form onSubmit={handleSubmit}>
              {/* New Password */}
              <Input
                label="New Password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<FiLock className="text-orange" />}
                required
              />

              {/* Strength Meter Gauge */}
              <div className="mb-4">
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
                required
              />

              {/* Security Notice Acknowledgement */}
              <div className="glass-panel mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="ackCheck"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    required
                  />
                  <label className="form-check-label small text-muted ms-1" htmlFor="ackCheck">
                    <FiAlertTriangle className="text-warning me-1" />
                    I understand that EtherVault <strong>cannot recover</strong> this password if lost.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!canProceed}
                  icon={<FiArrowRight />}
                >
                  Continue to Recovery Phrase
                </Button>

                <Link to="/" className="text-decoration-none">
                  <Button variant="glass" size="md" className="w-100" icon={<FiArrowLeft />}>
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

export default CreatePassword;
