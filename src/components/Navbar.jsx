import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BsHexagonFill } from 'react-icons/bs';
import { FaEthereum } from 'react-icons/fa';
import { FiMenu, FiShield, FiSettings } from 'react-icons/fi';
import { shortenAddress } from '../utils/mockData';

function Navbar({
  walletAddress = '0x71C8411F49B90D8198fA01119B3e329B35ffe296',
  network = 'Ethereum Mainnet',
  onNetworkClick = () => {},
  onMobileMenuClick = () => {}
}) {
  const location = useLocation();
  const isAuthPage = ['/', '/create-password', '/recovery-phrase', '/import-wallet'].includes(location.pathname);

  return (
    <nav className="vault-navbar navbar navbar-dark sticky-top">
      <div className="container-fluid px-lg-4">
        <div className="d-flex align-items-center gap-3">
          {/* Universal Collapsible Menu Hamburger Button (☰) */}
          {!isAuthPage && (
            <button
              onClick={onMobileMenuClick || onNetworkClick}
              className="btn btn-vault-glass p-2 d-inline-flex align-items-center justify-content-center"
              type="button"
              aria-label="Toggle Navigation Drawer"
              title="Open Navigation Menu (☰)"
              style={{ width: '40px', height: '40px' }}
            >
              <FiMenu className="fs-5" />
            </button>
          )}

          {/* Brand Logo */}
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="brand-emblem">
              <BsHexagonFill />
            </div>
            <span className="brand-title">
              Ether<span className="text-gradient">Vault</span>
            </span>
          </Link>
        </div>

        {/* Right side items */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            onClick={onNetworkClick}
            className="network-badge-btn border-0"
            type="button"
          >
            <span className="status-dot-pulse"></span>
            <FaEthereum className="text-orange" />
            <span>{network}</span>
          </button>

          {!isAuthPage ? (
            <>
              <Link to="/dashboard" className="btn btn-vault-glass btn-sm d-none d-sm-inline-flex align-items-center gap-1 font-mono">
                <FiShield className="text-purple" />
                <span>{shortenAddress(walletAddress, 4)}</span>
              </Link>
              <Link to="/settings" className="btn btn-vault-glass btn-sm p-2" title="Settings & Security">
                <FiSettings className="text-muted" />
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn-vault-primary btn-sm text-decoration-none">
              Open App
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
