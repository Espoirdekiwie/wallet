/**
 * ErrorBoundary.jsx
 * 
 * Global error boundary preventing blank white screens.
 * Displays a sleek glassmorphic error recovery card with options to retry or reset.
 */

import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EtherVault Unhandled Error Caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // preserve wallet keystore if exists, but clear any corrupted cache
        const wallet = window.localStorage.getItem('wallet');
        window.localStorage.clear();
        if (wallet) {
          window.localStorage.setItem('wallet', wallet);
        }
      }
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: '#0a0a0f', color: '#fff' }}>
          <div className="glass-card p-4 p-md-5 text-center" style={{ maxWidth: '480px', width: '100%', background: 'rgba(18, 18, 26, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px' }}>
            <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              <div className="brand-emblem text-danger" style={{ width: '48px', height: '48px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiAlertTriangle />
              </div>
            </div>

            <h3 className="fw-bold mb-2">Something Went Wrong</h3>
            <p className="text-muted small mb-3">
              EtherVault encountered an unexpected error. Your encrypted wallet data on this device is safe.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-3 text-start font-mono small mb-4 text-break" style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#F43F5E', maxHeight: '120px', overflowY: 'auto' }}>
                {this.state.error.toString()}
              </div>
            )}

            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <button
                onClick={this.handleReload}
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2"
                style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)', border: 'none', borderRadius: '12px', fontWeight: 600 }}
              >
                <FiRefreshCw /> Reload App
              </button>
              <button
                onClick={this.handleReset}
                className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2 px-4 py-2"
                style={{ borderRadius: '12px', borderColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                <FiHome /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
