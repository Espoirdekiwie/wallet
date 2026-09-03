import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiClock, 
  FiLogOut, 
  FiCopy, 
  FiCheck, 
  FiEye, 
  FiEyeOff, 
  FiTrendingUp,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';
import { BsHexagon, BsCurrencyDollar } from 'react-icons/bs';

import { 
  Navbar, 
  Sidebar, 
  Card, 
  WalletCard, 
  QRModal, 
  NetworkModal, 
  Button, 
  showToast 
} from '../components';
import { mockWallet, getStoredTransactions, shortenAddress } from '../utils/mockData';
import { useWallet } from '../context';

function Dashboard() {
  const navigate = useNavigate();
  const { address, lockWallet } = useWallet();
  const activeAddress = address || mockWallet.address;
  const recentTransactions = getStoredTransactions().slice(0, 2);

  // Default ETH Balance: 0 ETH (as requested)
  const ethBalance = '0.0000';
  const usdBalance = '0.00';
  const ethPrice = mockWallet.ethPrice; // $3,250.45 reference price

  const [isUsd, setIsUsd] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('mainnet');

  const toggleCurrency = () => {
    setIsUsd(!isUsd);
    showToast.info(isUsd ? 'Displaying balance in ETH' : 'Displaying balance in USD');
  };

  const handleCopyAddress = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(activeAddress);
    setCopiedAddress(true);
    showToast.success('Wallet address copied to clipboard!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleConfirmLogout = () => {
    lockWallet();
    showToast.info('Wallet locked & session cleared.');
    navigate('/');
  };


  return (
    <>
      <Navbar
        walletAddress={activeAddress}
        network={selectedNetwork === 'mainnet' ? 'Ethereum Mainnet' : selectedNetwork}
        onNetworkClick={() => setIsNetworkOpen(true)}
        onMobileMenuClick={() => setIsMobileNavOpen(true)}
      />

      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <div className="container-fluid px-lg-4 py-4">
        <div className="row justify-content-center">
          {/* Full-Width Main Dashboard Area */}
          <div className="col-12 col-xl-11">
            {/* Top Bar Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="fw-bold mb-0">
                  Wallet <span className="text-gradient">Dashboard</span>
                </h2>
                <p className="text-muted small mb-0 mt-1">Multi-chain non-custodial asset hub</p>
              </div>

              {/* Top Quick Actions */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setHideBalance(!hideBalance)}
                  icon={hideBalance ? <FiEye /> : <FiEyeOff />}
                >
                  {hideBalance ? 'Show' : 'Hide'}
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsLogoutModalOpen(true)}
                  icon={<FiLogOut />}
                >
                  Lock
                </Button>
              </div>
            </div>

            {/* 1. Hero Balance & Address Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card border-orange p-4 mb-4"
            >
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                {/* Left: Balance Display */}
                <div onClick={toggleCurrency} style={{ cursor: 'pointer' }} title="Click to toggle ETH / USD">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="small text-muted text-uppercase font-mono" style={{ letterSpacing: '0.1em' }}>
                      ETH Portfolio Balance
                    </span>
                    <span className="pnl-badge">
                      <FiTrendingUp /> 0.00% (24h)
                    </span>
                  </div>

                  <div className="balance-headline display-4 fw-900 text-gradient">
                    {hideBalance
                      ? '••••••••'
                      : isUsd
                      ? `$${usdBalance} USD`
                      : `${ethBalance} ETH`}
                  </div>

                  <div className="balance-secondary font-mono text-muted mt-1">
                    {hideBalance
                      ? '≈ $•••• USD'
                      : isUsd
                      ? `≈ ${ethBalance} ETH`
                      : `≈ $${usdBalance} USD`}
                  </div>
                </div>

                {/* Right: Public Address & Price Badge */}
                <div className="text-end">
                  <div className="glass-panel p-2 px-3 mb-2 text-start d-inline-block">
                    <div className="small text-muted font-mono mb-1">YOUR WALLET ADDRESS</div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="font-mono text-white fw-bold">{shortenAddress(activeAddress, 6)}</span>
                      <button
                        onClick={handleCopyAddress}
                        className="btn btn-sm btn-vault-glass p-1 font-mono"
                        title="Copy Address"
                      >
                        {copiedAddress ? <FiCheck className="text-success" /> : <FiCopy />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="badge bg-purple bg-opacity-25 text-purple-light font-mono px-3 py-1">
                      ETH Ref: ${ethPrice}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="gradient-divider my-4" />

              {/* 2. Core Transaction Action Cards */}
              <div className="row g-3">
                {/* Send Action Card */}
                <div className="col-md-6 col-12">
                  <div className="glass-panel p-3 h-100 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                        style={{ background: 'rgba(255, 107, 0, 0.15)', border: '1px solid var(--glass-border-orange)' }}
                      >
                        <FiArrowUpRight className="text-orange fs-3" />
                      </div>
                      <div>
                        <div className="fw-bold text-white fs-6 mb-0">Send Cryptocurrency</div>
                        <div className="small text-muted font-mono">Transfer ETH or tokens to any address</div>
                      </div>
                    </div>
                    <Link to="/send" className="text-decoration-none">
                      <Button variant="orange" size="sm" icon={<FiArrowUpRight />}>
                        Send Now
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Receive Action Card */}
                <div className="col-md-6 col-12">
                  <div className="glass-panel p-3 h-100 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                        style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid var(--glass-border-purple)' }}
                      >
                        <FiArrowDownLeft className="text-purple fs-3" />
                      </div>
                      <div>
                        <div className="fw-bold text-white fs-6 mb-0">Receive Crypto & QR</div>
                        <div className="small text-muted font-mono">Instant QR code & deposit address</div>
                      </div>
                    </div>
                    <Link to="/receive" className="text-decoration-none">
                      <Button variant="outline-purple" size="sm" icon={<FiArrowDownLeft />}>
                        Receive Assets
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 3. 3D Holographic Card & Account Overview */}
            <div className="row g-4 mb-4">
              {/* 3D Holographic Wallet Card */}
              <div className="col-lg-6">
                <WalletCard
                  address={activeAddress}
                  balance={ethBalance}
                  onQrClick={() => setIsQrOpen(true)}
                />
              </div>

              {/* Account Security & Network Status Card */}
              <div className="col-lg-6">
                <Card className="h-100 d-flex flex-column justify-content-between p-4">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold text-orange mb-0">
                        <FaEthereum className="me-2" /> Vault Status
                      </h5>
                      <span className="badge bg-success bg-opacity-25 text-success font-mono">
                        Client-Side Ready
                      </span>
                    </div>

                    <div className="glass-panel p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted font-mono">ACTIVE RPC NETWORK</span>
                        <span className="badge bg-success bg-opacity-25 text-success">Connected</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold font-mono text-white">
                          {selectedNetwork === 'mainnet' ? 'Ethereum Mainnet' : selectedNetwork}
                        </span>
                        <button
                          onClick={() => setIsNetworkOpen(true)}
                          className="btn btn-sm btn-vault-glass py-1 px-2 font-mono"
                        >
                          Switch
                        </button>
                      </div>
                    </div>

                    <div className="glass-panel p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted font-mono">STORAGE ENCRYPTION</span>
                        <span className="badge bg-warning bg-opacity-25 text-warning">AES-128-CTR</span>
                      </div>
                      <div className="small text-dim">Keys encrypted locally. Zero telemetry.</div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top border-white border-opacity-10 small font-mono">
                    <span className="text-muted">Type: HD Multi-Chain</span>
                    <Link to="/settings" className="text-purple text-decoration-none fw-bold">
                      View Keys & Security →
                    </Link>
                  </div>
                </Card>
              </div>
            </div>

            {/* 4. Token Holdings Section (Default 0 ETH) */}
            <div className="glass-card p-4 mb-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">
                  <FaEthereum className="text-orange me-2" /> Asset Holdings
                </h5>
                <span className="badge bg-secondary bg-opacity-25 text-dim font-mono">EVM Assets</span>
              </div>

              <div className="table-responsive">
                <table className="table table-dark table-borderless align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-muted small border-bottom border-secondary border-opacity-25">
                      <th scope="col">Asset</th>
                      <th scope="col" className="text-end">Reference Price</th>
                      <th scope="col" className="text-end">Balance</th>
                      <th scope="col" className="text-end">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-bottom border-white border-opacity-5">
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-2 rounded-3" style={{ background: 'rgba(255, 107, 0, 0.1)' }}>
                            <FaEthereum className="text-orange fs-4" />
                          </div>
                          <div>
                            <div className="fw-bold text-white mb-0">Ethereum</div>
                            <div className="small text-dim font-mono">ETH</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end font-mono">${ethPrice}</td>
                      <td className="text-end font-mono text-white fw-bold">
                        {hideBalance ? '••••' : `${ethBalance} ETH`}
                      </td>
                      <td className="text-end font-mono text-orange fw-bold">
                        {hideBalance ? '••••' : `$${usdBalance} USD`}
                      </td>
                    </tr>
                    <tr className="border-bottom border-white border-opacity-5">
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-2 rounded-3" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                            <BsHexagon className="text-purple fs-4" />
                          </div>
                          <div>
                            <div className="fw-bold text-white mb-0">Polygon</div>
                            <div className="small text-dim font-mono">MATIC</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end font-mono">$0.70</td>
                      <td className="text-end font-mono text-white fw-bold">
                        {hideBalance ? '••••' : '0.00 MATIC'}
                      </td>
                      <td className="text-end font-mono text-orange fw-bold">
                        {hideBalance ? '••••' : '$0.00 USD'}
                      </td>
                    </tr>
                    <tr className="border-bottom border-white border-opacity-5">
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-2 rounded-3" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                            <BsCurrencyDollar className="text-info fs-4" />
                          </div>
                          <div>
                            <div className="fw-bold text-white mb-0">USD Coin</div>
                            <div className="small text-dim font-mono">USDC</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end font-mono">$1.00</td>
                      <td className="text-end font-mono text-white fw-bold">
                        {hideBalance ? '••••' : '0.00 USDC'}
                      </td>
                      <td className="text-end font-mono text-orange fw-bold">
                        {hideBalance ? '••••' : '$0.00 USD'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Recent Activity Quick Card */}
            <div className="glass-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">
                  <FiClock className="text-purple me-2" /> Recent Transactions
                </h5>
                <Link to="/transactions" className="btn btn-sm btn-vault-glass text-decoration-none font-mono">
                  View All History →
                </Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="tx-card">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`tx-icon-pill ${tx.type === 'Send' ? 'tx-icon-sent' : 'tx-icon-received'}`}>
                        {tx.type === 'Send' ? <FiArrowUpRight /> : <FiArrowDownLeft />}
                      </div>
                      <div>
                        <div className="fw-bold text-white">{tx.type} {tx.asset}</div>
                        <div className="small text-muted font-mono">
                          {tx.type === 'Send' ? `To: ${shortenAddress(tx.to, 4)}` : `From: ${shortenAddress(tx.from, 4)}`} · {tx.timestamp}
                        </div>
                      </div>
                    </div>

                    <div className="text-end">
                      <div className={`fw-bold font-mono ${tx.type === 'Send' ? 'text-orange' : 'text-success'}`}>
                        {tx.type === 'Send' ? '-' : '+'} {tx.amount} {tx.asset}
                      </div>
                      <div className="small text-dim font-mono">{tx.usdAmount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Receive Modal */}
      <QRModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        address={activeAddress}
      />

      {/* Network Switcher Modal */}
      <NetworkModal
        isOpen={isNetworkOpen}
        onClose={() => setIsNetworkOpen(false)}
        selectedNetwork={selectedNetwork}
        onSelectNetwork={(net) => {
          setSelectedNetwork(net.id);
          showToast.success(`Switched to ${net.name}`);
        }}
      />

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1065 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content vault-modal-content">
              <div className="modal-header border-bottom border-danger border-opacity-25 p-4">
                <h5 className="modal-title fw-bold text-danger">
                  <FiAlertTriangle className="me-2" /> Confirm Logout
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-vault-glass"
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="text-muted mb-4">
                  Logging out will lock your active session. Your encrypted keystore remains stored locally and can be unlocked anytime with your password.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Button variant="glass" onClick={() => setIsLogoutModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleConfirmLogout} icon={<FiLogOut />}>
                    Log Out Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1060 }} onClick={() => setIsLogoutModalOpen(false)}></div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
