import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsHexagonFill } from 'react-icons/bs';
import { FiPlusCircle, FiDownload, FiShield, FiLock, FiZap, FiLayers } from 'react-icons/fi';
import { Button, Card } from '../components';

function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
  };

  return (
    <div className="container py-5 my-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="row justify-content-center"
      >
        <div className="col-lg-6 col-md-8 col-12 text-center">
          {/* Floating Hero Emblem */}
          <motion.div variants={itemVariants} className="mb-4">
            <div
              className="d-inline-flex p-4 rounded-circle"
              style={{
                background: 'var(--gradient-subtle)',
                border: '1px solid var(--glass-border-orange)',
                boxShadow: '0 0 35px var(--orange-glow)'
              }}
            >
              <BsHexagonFill
                style={{
                  fontSize: '3.5rem',
                  color: 'var(--orange)'
                }}
              />
            </div>
          </motion.div>

          {/* Title & Tagline */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ background: 'rgba(255, 107, 0, 0.08)', border: '1px solid var(--glass-border-orange)' }}>
              <FiShield className="text-orange" />
              <span className="small fw-bold text-orange font-mono">NON-CUSTODIAL & SECURE</span>
            </div>
            <h1 className="display-4 fw-900 mb-2">
              Next-Gen Web3 <span className="text-gradient">Vault</span>
            </h1>
            <p className="text-muted fs-5">
              Modern dark glassmorphism Ethereum gateway powered by Ethers.js v6.
            </p>
          </motion.div>

          {/* Action Card */}
          <motion.div variants={itemVariants}>
            <Card className="mb-4 text-start">
              <p className="text-muted text-center mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                Create a brand-new BIP39 12-word cryptographic wallet or restore an existing account instantly.
              </p>

              <div className="d-grid gap-3">
                <Link to="/create-password" className="text-decoration-none">
                  <Button variant="primary" size="lg" className="w-100" icon={<FiPlusCircle className="fs-5" />}>
                    Create New Wallet
                  </Button>
                </Link>

                <Link to="/import-wallet" className="text-decoration-none">
                  <Button variant="outline-purple" size="lg" className="w-100" icon={<FiDownload className="fs-5" />}>
                    Import Existing Phrase
                  </Button>
                </Link>

                <Link to="/dashboard" className="text-decoration-none">
                  <Button variant="glass" size="md" className="w-100">
                    Direct Launch Demo Dashboard
                  </Button>
                </Link>
              </div>

              <hr className="gradient-divider mt-4 mb-3" />

              <div className="d-flex align-items-center gap-2 small text-muted">
                <FiLock className="text-orange fs-5 flex-shrink-0" />
                <span>Zero telemetry. Your private keys never leave your device.</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature Highlights Grid */}
          <motion.div variants={itemVariants} className="row g-3 text-start">
            <div className="col-md-4">
              <div className="glass-panel p-3 h-100">
                <FiLock className="text-orange fs-4 mb-2" />
                <h6 className="fw-bold mb-1">Non-Custodial</h6>
                <p className="text-dim small mb-0">Full client-side ownership of cryptographic keys.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-panel p-3 h-100">
                <FiZap className="text-purple fs-4 mb-2" />
                <h6 className="fw-bold mb-1">Multi-Chain</h6>
                <p className="text-dim small mb-0">Ethereum Mainnet, Sepolia, Polygon, and Arbitrum.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-panel p-3 h-100">
                <FiLayers className="text-orange fs-4 mb-2" />
                <h6 className="fw-bold mb-1">Glassmorphism</h6>
                <p className="text-dim small mb-0">Ultra-modern luxury Web3 UI with 3D tilt physics.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
