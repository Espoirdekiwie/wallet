import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { 
  FiArrowDownLeft, 
  FiCopy, 
  FiCheck, 
  FiShare2, 
  FiArrowLeft, 
  FiShield
} from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';

import { 
  Navbar, 
  Sidebar, 
  Card, 
  Button, 
  Input, 
  LockScreen,
  showToast 
} from '../components';
import { mockWallet } from '../utils/mockData';
import { useWallet } from '../context';
import { walletService } from '../services';

function Receive() {
  const navigate = useNavigate();
  const { address, isUnlocked, isInitialized } = useWallet();
  const activeAddress = address || walletService.getStoredAddress() || mockWallet.address;

  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Dynamic QR Code URI (EIP-681 standard)
  const qrUri = amount 
    ? `ethereum:${activeAddress}?value=${amount}`
    : activeAddress;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    showToast.success('Wallet address copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EtherVault Public Address',
          text: `My Ethereum wallet address: ${activeAddress}`,
          url: window.location.href
        });
      } catch {
        // user dismissed share dialog
      }
    } else {
      handleCopy();
    }
  };

  // If no wallet exists in storage, redirect to import
  if (!isInitialized) {
    navigate('/import-wallet');
    return null;
  }

  // If local wallet exists but session is locked, show LockScreen
  if (isInitialized && !isUnlocked) {
    return <LockScreen />;
  }

  return (
    <>
      <Navbar
        walletAddress={activeAddress}
        onMobileMenuClick={() => setIsMobileNavOpen(true)}
      />

      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <div className="container-fluid px-lg-4 py-4">
        <div className="row justify-content-center">
          {/* Receive Content Container */}
          <div className="col-lg-8 col-xl-7 col-12 text-center">
            <div className="d-flex align-items-center justify-content-between mb-4 text-start">
              <div>
                <h2 className="fw-bold mb-0">
                  <FiArrowDownLeft className="text-purple me-2" /> Receive <span className="text-gradient">Assets</span>
                </h2>
                <p className="text-muted small mb-0 mt-1">Scan QR code or copy public address to receive crypto</p>
              </div>
              <Button variant="glass" size="sm" onClick={() => navigate('/dashboard')} icon={<FiArrowLeft />}>
                Dashboard
              </Button>
            </div>

            <Card className="text-center">
              {/* Network Badge */}
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4" style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid var(--glass-border-purple)' }}>
                <FaEthereum className="text-purple" />
                <span className="small fw-bold text-purple-light font-mono">Ethereum & ERC-20 Network</span>
              </div>

              {/* Luminous QR Frame */}
              <div className="d-flex justify-content-center mb-4">
                <div className="qr-frame">
                  <QRCode
                    value={qrUri}
                    size={200}
                    bgColor="#FFFFFF"
                    fgColor="#07060A"
                  />
                </div>
              </div>

              {/* Request Specific Amount */}
              <div className="mb-4 text-start">
                <Input
                  label="Request Specific ETH Amount (Optional)"
                  type="number"
                  step="0.01"
                  placeholder="0.00 ETH"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  mono
                  helperText="Generates an EIP-681 standard QR code with pre-filled amount"
                />
              </div>

              {/* Full Address Display Box */}
              <div className="glass-panel p-3 mb-4 text-start">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted font-mono text-uppercase">Your Public Address</span>
                  <span className="badge bg-success bg-opacity-25 text-success font-mono">Active</span>
                </div>
                <div className="font-mono text-orange fw-bold fs-6 text-break">
                  {activeAddress}
                </div>
              </div>

              {/* Copy & Share Actions */}
              <div className="row g-2 mb-3">
                <div className="col-8">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 font-mono"
                    onClick={handleCopy}
                    icon={copied ? <FiCheck className="text-success" /> : <FiCopy />}
                  >
                    {copied ? 'Address Copied!' : 'Copy Wallet Address'}
                  </Button>
                </div>
                <div className="col-4">
                  <Button
                    variant="glass"
                    size="lg"
                    className="w-100 font-mono"
                    onClick={handleShare}
                    icon={<FiShare2 className="text-purple" />}
                  >
                    Share
                  </Button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="d-flex align-items-center gap-2 small text-muted text-start mt-3 pt-3 border-top border-white border-opacity-10">
                <FiShield className="text-orange fs-5 flex-shrink-0" />
                <span>Only send Ethereum (ETH) and EVM-compatible tokens (ERC-20) to this address.</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default Receive;
