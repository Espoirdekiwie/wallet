import React, { useState, useEffect } from 'react';
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
  LockScreen,
  showToast 
} from '../components';
import { mockWallet, saveTransaction } from '../utils/mockData';
import { useWallet } from '../context';
import { walletService } from '../services';
import { sendTransaction, getBalance } from '../services/blockchain';

function Send() {
  const navigate = useNavigate();
  const { address, privateKey: memoryPrivateKey, isUnlocked, isInitialized } = useWallet();
  const activeAddress = address || walletService.getStoredAddress() || mockWallet.address;

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientError, setRecipientError] = useState(null);
  const [amountError, setAmountError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txDetails, setTxDetails] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [availableBalance, setAvailableBalance] = useState('0.0000');

  const ethPrice = 3250.45;
  const numAmount = parseFloat(amount || '0');
  const usdEquivalent = (numAmount * ethPrice).toFixed(2);

  // Fetch live balance to assist input and validation
  useEffect(() => {
    if (!activeAddress) return;
    getBalance(activeAddress)
      .then((res) => {
        if (res && res.formatted) setAvailableBalance(res.formatted);
      })
      .catch((err) => console.warn('Balance check error:', err));
  }, [activeAddress]);

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

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Retrieve active private key strictly from in-memory context state
    const signingKey = memoryPrivateKey;
    if (!signingKey) {
      showToast.error('Wallet is locked. Please unlock your wallet to sign this transaction.');
      return;
    }

    setLoading(true);

    try {
      showToast.info('Broadcasting transaction to Sepolia Testnet...');
      
      // PART 5: Broadcast real transaction to Sepolia using in-memory key
      const result = await sendTransaction(signingKey, recipient.trim(), amount);

      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'Send',
        asset: 'ETH',
        amount: parseFloat(amount).toFixed(4),
        usdAmount: `$${usdEquivalent}`,
        to: recipient.trim(),
        from: activeAddress,
        timestamp: 'Just now',
        status: result.status,
        hash: result.hash,
        gasUsed: result.gasUsed
      };

      // Store transaction in localStorage
      saveTransaction(newTx);
      setTxDetails(newTx);
      setIsSuccess(true);
      showToast.success(`Transaction Confirmed! Hash: ${result.hash.slice(0, 10)}...`);

      // Automatically return to Dashboard after confirmation
      setTimeout(() => {
        navigate('/dashboard');
      }, 3500);
    } catch (error) {
      console.error('Send transaction error:', error);
      showToast.error(error.message || 'Transaction failed. Check balance and network.');
    } finally {
      setLoading(false);
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
                    className="alert alert-success p-4 mb-4 rounded-4"
                    style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1.5px solid #10B981' }}
                  >
                    <FiCheckCircle className="text-success display-4 mb-2 d-block mx-auto text-center" />
                    <h4 className="fw-bold text-success mb-2 text-center">Transaction Confirmed</h4>
                    <p className="small text-muted font-mono mb-3 text-center">
                      Sent {txDetails?.amount} ETH to {txDetails?.to}
                    </p>

                    <div className="glass-panel p-3 mb-3 font-mono small text-start">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Status:</span>
                        <span className="badge bg-success bg-opacity-25 text-success">
                          {txDetails?.status || 'Confirmed'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Gas Used:</span>
                        <span className="text-white">{txDetails?.gasUsed || '21000'} units</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Tx Hash:</span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${txDetails?.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange text-decoration-none fw-bold"
                          title="View on Sepolia Etherscan"
                        >
                          {txDetails?.hash ? `${txDetails.hash.slice(0, 10)}...${txDetails.hash.slice(-8)}` : 'N/A'} ↗
                        </a>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="badge bg-success bg-opacity-25 text-success font-mono">
                        Returning to Dashboard...
                      </span>
                    </div>
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
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted font-mono">Available: {availableBalance} ETH</span>
                    {parseFloat(availableBalance) > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount((Math.max(0, parseFloat(availableBalance) - 0.001)).toFixed(4))}
                        className="btn btn-sm btn-vault-glass py-0 px-2 font-mono small text-purple"
                      >
                        Max (after gas)
                      </button>
                    )}
                  </div>
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
                    helperText={amount && numAmount > 0 ? `≈ $${usdEquivalent} USD` : 'Enter transfer amount in Sepolia ETH'}
                    disabled={loading || isSuccess}
                    required
                  />
                </div>

                {/* Live Sepolia Notice Panel */}
                <div className="glass-panel p-3 mb-4 font-mono small text-muted">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Network:</span>
                    <span className="badge bg-purple bg-opacity-25 text-purple font-mono">Ethereum Sepolia</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>RPC Endpoint:</span>
                    <span className="text-dim">ethereum-sepolia-rpc.publicnode.com</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Gas Execution:</span>
                    <span className="text-success">Live On-Chain (Sepolia)</span>
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
                  {loading ? 'Broadcasting to Sepolia...' : isSuccess ? 'Transaction Confirmed' : 'Send Transaction'}
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
