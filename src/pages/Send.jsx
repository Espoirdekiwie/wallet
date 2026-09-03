import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { 
  FiArrowUpRight, 
  FiUser, 
  FiCheckCircle, 
  FiArrowLeft,
  FiCheck
} from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';

import { 
  Navbar, 
  Sidebar, 
  Card, 
  Button, 
  Input, 
  showToast 
} from '../components';
import { mockWallet, saveTransaction } from '../utils/mockData';
import { useWallet } from '../context';

function Send() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const activeAddress = address || mockWallet.address;

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientError, setRecipientError] = useState(null);
  const [amountError, setAmountError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txDetails, setTxDetails] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const ethPrice = 3250.45;
  const numAmount = parseFloat(amount || '0');
  const usdEquivalent = (numAmount * ethPrice).toFixed(2);

  // Quick Paste handler
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRecipient(text.trim());
        setRecipientError(null);
        showToast.info('Address pasted from clipboard');
      }
    } catch {
      showToast.info('Paste address directly into the field');
    }
  };

  // Validation
  const validateForm = () => {
    let isValid = true;
    setRecipientError(null);
    setAmountError(null);

    const cleanRecipient = recipient.trim();

    // 1. Validate Ethereum Address using ethers.isAddress
    if (!cleanRecipient) {
      setRecipientError('Recipient address is required.');
      isValid = false;
    } else if (!ethers.isAddress(cleanRecipient)) {
      setRecipientError('Invalid Ethereum address format. Address must start with 0x and contain 40 hexadecimal characters.');
      isValid = false;
    }

    // 2. Validate Amount
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Please enter a valid amount greater than 0 ETH.');
      isValid = false;
    }

    return isValid;
  };

  const handleSendSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Simulate local demo transaction creation (DO NOT broadcast to blockchain)
    setTimeout(() => {
      const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'Send',
        asset: 'ETH',
        amount: parseFloat(amount).toFixed(4),
        usdAmount: `$${usdEquivalent}`,
        to: recipient.trim(),
        from: activeAddress,
        timestamp: 'Just now',
        status: 'Confirmed',
        hash: `0x${randomHex}`
      };

      // Store demo transaction in localStorage
      saveTransaction(newTx);

      setTxDetails(newTx);
      setLoading(false);
      setIsSuccess(true);
      showToast.success('Transaction Successful!');

      // Navigate back to Dashboard after short confirmation
      setTimeout(() => {
        navigate('/dashboard');
      }, 2200);
    }, 1200);
  };

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
          {/* Send Form Container */}
          <div className="col-lg-8 col-xl-7 col-12">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="fw-bold mb-0">
                  <FiArrowUpRight className="text-orange me-2" /> Send <span className="text-gradient">ETH</span>
                </h2>
                <p className="text-muted small mb-0 mt-1">Create demo Ethereum transfer</p>
              </div>
              <Button variant="glass" size="sm" onClick={() => navigate('/dashboard')} icon={<FiArrowLeft />}>
                Dashboard
              </Button>
            </div>

            <Card>
              {/* Success Notification Banner */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="alert alert-success p-4 mb-4 text-center rounded-4"
                    style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1.5px solid #10B981' }}
                  >
                    <FiCheckCircle className="text-success display-4 mb-2 d-block mx-auto" />
                    <h4 className="fw-bold text-success mb-1">Transaction Successful</h4>
                    <p className="small text-muted font-mono mb-2">
                      Sent {txDetails?.amount} ETH to {txDetails?.to?.slice(0, 10)}...
                    </p>
                    <span className="badge bg-success bg-opacity-25 text-success font-mono">
                      Returning to Dashboard...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendSubmit}>
                {/* Field 1: Recipient Ethereum Address */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="vault-label mb-0">Recipient Address</label>
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="btn btn-sm btn-vault-glass py-0 px-2 font-mono small text-orange"
                    >
                      Paste
                    </button>
                  </div>
                  <Input
                    type="text"
                    mono
                    placeholder="0x... (42-character hex address)"
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value);
                      if (recipientError) setRecipientError(null);
                    }}
                    error={recipientError}
                    icon={<FiUser className="text-orange" />}
                    disabled={loading || isSuccess}
                    required
                  />
                  {recipient && !recipientError && ethers.isAddress(recipient.trim()) && (
                    <div className="small text-success font-mono mt-1">
                      <FiCheck className="me-1" /> Valid Ethereum address
                    </div>
                  )}
                </div>

                {/* Field 2: Amount (ETH) */}
                <div className="mb-4">
                  <Input
                    label="Amount (ETH)"
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (amountError) setAmountError(null);
                    }}
                    error={amountError}
                    mono
                    icon={<FaEthereum className="text-purple" />}
                    helperText={amount && numAmount > 0 ? `≈ $${usdEquivalent} USD` : 'Enter transfer amount in ETH'}
                    disabled={loading || isSuccess}
                    required
                  />
                </div>

                {/* Demo Notice Panel */}
                <div className="glass-panel p-3 mb-4 font-mono small text-muted">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Transaction Mode:</span>
                    <span className="badge bg-warning bg-opacity-25 text-warning font-mono">Demo Simulation</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Estimated Gas:</span>
                    <span className="text-success">0.0000 ETH (Free)</span>
                  </div>
                  <div className="d-flex justify-content-between text-dim">
                    <span>Local Storage:</span>
                    <span>Saved locally to activity history</span>
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading || isSuccess || !recipient || !amount}
                  className="w-100"
                  icon={<FiArrowUpRight className="fs-5" />}
                >
                  {loading ? 'Processing Transfer...' : isSuccess ? 'Transaction Successful' : 'Send Transaction'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default Send;
