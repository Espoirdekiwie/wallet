import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiClipboard, 
  FiDownload, 
  FiCheck, 
  FiAlertTriangle, 
  FiArrowRight, 
  FiArrowLeft,
  FiLock
} from 'react-icons/fi';
import { Button, Card, showToast } from '../components';
import { useWallet } from '../context';
import { mockWallet } from '../utils/mockData';

function RecoveryPhrase() {
  const navigate = useNavigate();
  const { pendingMnemonic, address, finalizeAndSaveWallet } = useWallet();

  // Use dynamically generated phrase from ethers.js or fallback if testing page directly
  const activePhrase = pendingMnemonic || mockWallet.mnemonic;
  const activeAddress = address || mockWallet.address;
  const words = (activePhrase || '').split(' ');
  const fullPhrase = activePhrase || '';

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState('');


  // 1. Copy Phrase to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(fullPhrase);
    setCopied(true);
    showToast.success('12-word recovery phrase copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // 2. Download Phrase as .txt file
  const handleDownload = () => {
    const backupContent = [
      '=================================================================',
      '               ETHERVAULT RECOVERY PHRASE BACKUP                 ',
      '=================================================================',
      '',
      `Wallet Public Address: ${activeAddress}`,
      `Created: ${new Date().toLocaleString()}`,
      '',
      '-----------------------------------------------------------------',
      '12-WORD SECRET BIP39 RECOVERY PHRASE:',
      '-----------------------------------------------------------------',
      fullPhrase,
      '',
      '-----------------------------------------------------------------',
      'CRITICAL SECURITY WARNING:',
      '• NEVER share your recovery phrase with anyone.',
      '• EtherVault will NEVER ask for your recovery phrase.',
      '• Anyone who gets these 12 words can access and steal your funds.',
      '• Store this file offline on a secure external device or write it down.',
      '================================================================='
    ].join('\n');

    const blob = new Blob([backupContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EtherVault-Backup-${activeAddress.slice(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloaded(true);
    showToast.info('Recovery phrase backup (.txt) downloaded successfully.');
    setTimeout(() => setDownloaded(false), 3000);
  };

  // 3. Continue: Encrypt wallet, save encrypted JSON locally, and navigate to Dashboard
  const handleContinue = async () => {
    setEncrypting(true);
    setEncryptionProgress('Encrypting wallet with AES-128-CTR and Scrypt KDF...');

    try {
      // Calls finalizeAndSaveWallet: encrypts wallet to Keystore JSON,
      // saves locally to localStorage, and purges plaintext private key and mnemonic.
      await finalizeAndSaveWallet((progress) => {
        if (progress < 1) {
          setEncryptionProgress(`Encrypting Keystore JSON: ${Math.round(progress * 100)}%`);
        }
      });

      showToast.success('Wallet encrypted and saved securely!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Wallet encryption error:', error);
      showToast.error(error.message || 'Failed to encrypt and save wallet.');
    } finally {
      setEncrypting(false);
      setEncryptionProgress('');
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-12">
          <Card>
            {/* Step Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-purple bg-opacity-25 text-purple-light font-mono px-3 py-1 rounded-pill">
                Step 2 of 2
              </span>
              <span className="small text-muted font-mono">12-Word Secret Backup</span>
            </div>

            {/* Stepper Progress */}
            <div className="strength-track mb-4" style={{ height: '4px' }}>
              <div className="strength-bar" style={{ width: '100%', background: 'var(--gradient-primary)' }}></div>
            </div>

            <h2 className="fw-bold mb-2">Secret Recovery Phrase</h2>
            <p className="text-muted small mb-4">
              Write down these 12 BIP39 cryptographic words in exact order and store them in a secure offline location.
            </p>

            {/* Security Warning Callout */}
            <div
              className="alert alert-danger mb-4 d-flex align-items-start gap-3 rounded-4"
              style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.3)'
              }}
            >
              <FiAlertTriangle className="text-danger fs-3 mt-1 flex-shrink-0" />
              <div>
                <strong className="d-block text-danger mb-1">
                  SECURITY WARNING: Never share your recovery phrase.
                </strong>
                <span className="small text-muted">
                  Anyone possessing these 12 words can access all your funds across any wallet application permanently. 
                  EtherVault stores only your password-encrypted Keystore locally.
                </span>
              </div>
            </div>

            {/* 12-Word Phrase Grid */}
            <div className="row g-2 mb-4">
              {words.map((word, index) => (
                <div key={index} className="col-md-4 col-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="word-card"
                  >
                    <span className="badge bg-warning bg-opacity-10 text-orange mb-1 font-mono small">
                      #{index + 1}
                    </span>
                    <div className="fw-bold font-mono fs-5 text-white">{word}</div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Action Buttons: Copy Phrase & Download Phrase */}
            <div className="row g-2 mb-4">
              <div className="col-sm-6 col-12">
                <Button
                  variant="outline-orange"
                  className="w-100 font-mono"
                  onClick={handleCopy}
                  disabled={encrypting}
                  icon={copied ? <FiCheck className="text-success" /> : <FiClipboard />}
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Phrase'}
                </Button>
              </div>
              <div className="col-sm-6 col-12">
                <Button
                  variant="glass"
                  className="w-100 font-mono"
                  onClick={handleDownload}
                  disabled={encrypting}
                  icon={downloaded ? <FiCheck className="text-purple" /> : <FiDownload className="text-purple" />}
                >
                  {downloaded ? 'Backup Downloaded' : 'Download Phrase (.txt)'}
                </Button>
              </div>
            </div>

            {/* Encryption Progress Indicator */}
            {encryptionProgress && (
              <div className="text-center font-mono small text-orange mb-3 animate-pulse">
                <FiLock className="me-1" />
                {encryptionProgress}
              </div>
            )}

            {/* Continue & Back Navigation Buttons */}
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                size="lg"
                loading={encrypting}
                onClick={handleContinue}
                icon={<FiArrowRight />}
              >
                {encrypting ? 'Encrypting & Saving Vault...' : 'Continue to Dashboard'}
              </Button>

              <Link to="/create-password" className="text-decoration-none">
                <Button
                  variant="glass"
                  size="md"
                  className="w-100"
                  disabled={encrypting}
                  icon={<FiArrowLeft />}
                >
                  Back to Password
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RecoveryPhrase;
