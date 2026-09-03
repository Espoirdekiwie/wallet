import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiClock, 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiRepeat, 
  FiSearch, 
  FiDownload, 
  FiArrowLeft,
  FiCheckCircle,
  FiInbox,
  FiCopy,
  FiCheck,
  FiTrash2
} from 'react-icons/fi';

import { 
  Navbar, 
  Sidebar, 
  Button, 
  showToast 
} from '../components';
import { mockWallet, getStoredTransactions, shortenAddress } from '../utils/mockData';
import { useWallet } from '../context';

function Transactions() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const activeAddress = address || mockWallet.address;

  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = getStoredTransactions();
      return [...(stored || [])].sort((a, b) => {
        const timeA = parseInt(a.id?.replace(/\D/g, '') || '0', 10);
        const timeB = parseInt(b.id?.replace(/\D/g, '') || '0', 10);
        return timeB - timeA;
      });
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);



  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    showToast.success('Transaction hash copied!');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all local transaction history?')) {
      localStorage.removeItem('ethervault_transactions_v1');
      setTransactions([]);
      showToast.info('Transaction history cleared.');
    }
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      showToast.warning('No transactions available to export.');
      return;
    }

    const headers = ['ID', 'Type', 'Asset', 'Amount', 'USD_Value', 'Recipient_or_Sender', 'Status', 'Date', 'Hash'];
    const rows = transactions.map(tx => [
      tx.id,
      tx.type,
      tx.asset,
      tx.amount,
      tx.usdAmount,
      tx.to || tx.from || '',
      tx.status,
      tx.timestamp,
      tx.hash
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ethervault_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast.success('Transaction activity exported to CSV!');
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Type Filter
    if (filter === 'sent' && tx.type !== 'Send') return false;
    if (filter === 'received' && tx.type !== 'Receive') return false;
    if (filter === 'swap' && tx.type !== 'Swap') return false;

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHash = tx.hash?.toLowerCase().includes(q);
      const matchAsset = tx.asset?.toLowerCase().includes(q);
      const matchTo = tx.to && tx.to.toLowerCase().includes(q);
      const matchFrom = tx.from && tx.from.toLowerCase().includes(q);
      return matchHash || matchAsset || matchTo || matchFrom;
    }

    return true;
  });

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
          {/* Activity Stream Container */}
          <div className="col-12 col-xl-11">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="fw-bold mb-0">
                  <FiClock className="text-purple me-2" /> Activity <span className="text-gradient">History</span>
                </h2>
                <p className="text-muted small mb-0 mt-1">Real-time local ledger and historical transaction transfers</p>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                {transactions.length > 0 && (
                  <>
                    <Button variant="glass" size="sm" onClick={handleExportCsv} icon={<FiDownload />}>
                      Export CSV
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleClearHistory} icon={<FiTrash2 />}>
                      Clear
                    </Button>
                  </>
                )}
                <Button variant="glass" size="sm" onClick={() => navigate('/dashboard')} icon={<FiArrowLeft />}>
                  Dashboard
                </Button>
              </div>
            </div>

            {/* Filter & Search Controls */}
            <div className="glass-card p-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
              {/* Filter Tabs */}
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`btn font-mono ${filter === 'all' ? 'btn-vault-primary' : 'btn-vault-glass'}`}
                >
                  All ({transactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('sent')}
                  className={`btn font-mono ${filter === 'sent' ? 'btn-vault-primary' : 'btn-vault-glass'}`}
                >
                  Sent
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('received')}
                  className={`btn font-mono ${filter === 'received' ? 'btn-vault-primary' : 'btn-vault-glass'}`}
                >
                  Received
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('swap')}
                  className={`btn font-mono ${filter === 'swap' ? 'btn-vault-primary' : 'btn-vault-glass'}`}
                >
                  Swaps
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ minWidth: '260px' }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary border-opacity-25 text-muted">
                    <FiSearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter by hash, asset, address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control vault-input vault-input-mono border-start-0 py-1"
                  />
                </div>
              </div>
            </div>

            {/* Transaction Cards List (Newest First) */}
            <div className="d-flex flex-column gap-3">
              {filteredTransactions.length === 0 ? (
                /* Empty State Card */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card text-center py-5 px-4"
                >
                  <div
                    className="d-inline-flex p-3 rounded-circle mb-3"
                    style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid var(--glass-border-purple)'
                    }}
                  >
                    <FiInbox className="fs-1 text-purple-light" />
                  </div>
                  <h4 className="fw-bold text-white mb-2">No Transactions Found</h4>
                  <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                    {searchQuery || filter !== 'all'
                      ? 'No activity matches your current filter or search criteria.'
                      : 'You have not made any cryptocurrency transfers yet on this account.'}
                  </p>

                  <div className="d-flex justify-content-center gap-3">
                    <Link to="/receive" className="text-decoration-none">
                      <Button variant="primary" size="md" icon={<FiArrowDownLeft />}>
                        Receive Funds
                      </Button>
                    </Link>
                    <Link to="/send" className="text-decoration-none">
                      <Button variant="outline-orange" size="md" icon={<FiArrowUpRight />}>
                        Send Crypto
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* Transaction Cards */
                <AnimatePresence>
                  {filteredTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id || index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="tx-card"
                    >
                      {/* Left: Icon & Details */}
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className={`tx-icon-pill ${
                            tx.type === 'Send'
                              ? 'tx-icon-sent'
                              : tx.type === 'Receive'
                              ? 'tx-icon-received'
                              : 'tx-icon-swap'
                          }`}
                        >
                          {tx.type === 'Send' ? (
                            <FiArrowUpRight />
                          ) : tx.type === 'Receive' ? (
                            <FiArrowDownLeft />
                          ) : (
                            <FiRepeat />
                          )}
                        </div>

                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            <span className="fw-bold text-white fs-6">
                              {tx.type === 'Send' ? 'Sent' : tx.type === 'Receive' ? 'Received' : 'Swapped'}{' '}
                              {tx.asset}
                            </span>
                            <span className="badge-status success font-mono">
                              <FiCheckCircle className="me-1" /> {tx.status || 'Confirmed'}
                            </span>
                          </div>

                          <div className="small text-muted font-mono d-flex align-items-center gap-2 flex-wrap">
                            <span>{tx.timestamp}</span>
                            <span>•</span>
                            {tx.to && <span>To: {shortenAddress(tx.to, 4)}</span>}
                            {tx.from && <span>From: {shortenAddress(tx.from, 4)}</span>}
                            <span>•</span>
                            <span className="text-dim">Hash: {shortenAddress(tx.hash, 4)}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyHash(tx.hash)}
                              className="btn btn-sm btn-vault-glass p-0 px-1 font-mono text-dim"
                              title="Copy Hash"
                            >
                              {copiedHash === tx.hash ? (
                                <FiCheck className="text-success" />
                              ) : (
                                <FiCopy />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Fiat Value */}
                      <div className="text-end">
                        <div
                          className={`fw-bold font-mono fs-5 ${
                            tx.type === 'Send'
                              ? 'text-orange'
                              : tx.type === 'Receive'
                              ? 'text-success'
                              : 'text-purple'
                          }`}
                        >
                          {tx.type === 'Send' ? '-' : tx.type === 'Receive' ? '+' : ''} {tx.amount} {tx.asset}
                        </div>
                        <div className="small text-dim font-mono">{tx.usdAmount}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Transactions;
