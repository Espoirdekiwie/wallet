import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiCopy, FiCheck, FiShield } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import { FaEthereum } from 'react-icons/fa';
import { shortenAddress } from '../utils/mockData';

function WalletCard({
  address = '0x71C8411F49B90D8198fA01119B3e329B35ffe296',
  balance = '2.4500',
  network = 'Ethereum Mainnet',
  walletName = 'EtherVault HD',
  onQrClick = () => {}
}) {
  const [copied, setCopied] = useState(false);

  // Mouse tilt motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wallet-card-container">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="vault-wallet-card d-flex flex-column justify-content-between"
      >
        {/* Top row */}
        <div>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="card-chip"></div>
            <div className="badge bg-dark bg-opacity-60 border border-secondary border-opacity-50 px-3 py-1 rounded-pill d-flex align-items-center gap-1">
              <FiShield className="text-warning" />
              <span className="small font-mono text-white">{walletName}</span>
            </div>
          </div>

          <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-2">
            <div>
              <div className="small text-muted text-uppercase font-mono mb-1" style={{ letterSpacing: '0.1em' }}>
                Public Address
              </div>
              <div className="font-mono text-white fs-5 fw-bold text-break">
                {shortenAddress(address, 8)}
              </div>
            </div>
            <div className="text-end">
              <div className="small text-muted text-uppercase font-mono mb-1">Balance</div>
              <div className="font-mono text-orange fw-bold">{balance} ETH</div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="d-flex justify-content-between align-items-end pt-3 border-top border-white border-opacity-10">
          <div>
            <div className="small text-dim font-mono">NETWORK</div>
            <div className="fw-bold text-orange font-mono d-flex align-items-center gap-1">
              <FaEthereum /> {network}
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={handleCopy}
              className="btn btn-outline-warning btn-sm rounded-pill font-mono d-inline-flex align-items-center gap-1"
            >
              {copied ? <FiCheck className="text-success" /> : <FiCopy />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onQrClick}
              className="btn btn-outline-light btn-sm rounded-pill d-inline-flex align-items-center"
              title="Show QR Code"
            >
              <BsQrCode />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default WalletCard;
