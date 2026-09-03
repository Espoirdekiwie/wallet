import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { FiCopy, FiCheck, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function QRModal({
  isOpen,
  onClose,
  address = '0x71C8411F49B90D8198fA01119B3e329B35ffe296',
  network = 'Ethereum Mainnet'
}) {
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const qrValue = amount ? `ethereum:${address}?value=${amount}` : address;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div
        className="modal-backdrop show"
        onClick={onClose}
        style={{ zIndex: 1060 }}
      ></div>

      <div
        className="modal show d-block"
        tabIndex="-1"
        style={{ zIndex: 1065 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="modal-content vault-modal-content"
          >
            <div className="modal-header border-bottom border-white border-opacity-10 p-4 pb-3">
              <h5 className="modal-title fw-bold text-white">
                Receive Assets ({network})
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-vault-glass"
                onClick={onClose}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body p-4 text-center">
              <p className="text-muted small mb-3">
                Scan with any Web3 wallet to send funds to this account
              </p>

              <div className="qr-frame mb-3">
                <QRCode
                  value={qrValue}
                  size={160}
                  bgColor="#FFFFFF"
                  fgColor="#0B0E14"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="vault-label">Request Specific Amount (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00 ETH"
                  className="form-control vault-input vault-input-mono text-center"
                />
              </div>

              <div className="p-2 rounded font-mono small text-dim text-break mb-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                {address}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-vault-primary w-100 font-mono"
              >
                {copied ? <FiCheck className="me-1 text-success" /> : <FiCopy className="me-1" />}
                <span>{copied ? 'Address Copied!' : 'Copy Wallet Address'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default QRModal;
