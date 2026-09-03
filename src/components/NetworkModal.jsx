import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
import { FaEthereum, FaFlask } from 'react-icons/fa';
import { BsHexagon, BsLayers } from 'react-icons/bs';
import { mockNetworks } from '../utils/mockData';

function NetworkModal({
  isOpen,
  onClose,
  selectedNetwork = 'mainnet',
  onSelectNetwork = () => {}
}) {
  if (!isOpen) return null;

  const getNetworkIcon = (iconName, color) => {
    switch (iconName) {
      case 'bi-ethereum': return <FaEthereum style={{ color }} className="fs-5" />;
      case 'bi-hexagon': return <BsHexagon style={{ color }} className="fs-5" />;
      case 'bi-layers': return <BsLayers style={{ color }} className="fs-5" />;
      case 'bi-vial': return <FaFlask style={{ color }} className="fs-5" />;
      default: return <FaEthereum style={{ color }} className="fs-5" />;
    }
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
              <h5 className="modal-title fw-bold text-white">Select Blockchain Network</h5>
              <button
                type="button"
                className="btn btn-sm btn-vault-glass"
                onClick={onClose}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body p-4">
              <div className="d-grid gap-2">
                {mockNetworks.map((net) => {
                  const isSelected = selectedNetwork === net.id;
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => {
                        onSelectNetwork(net);
                        onClose();
                      }}
                      className={`btn text-start p-3 d-flex justify-content-between align-items-center ${
                        isSelected ? 'btn-vault-primary' : 'btn-vault-glass'
                      }`}
                    >
                      <div className="d-flex align-items-center gap-3">
                        {getNetworkIcon(net.icon, net.color)}
                        <div>
                          <div className="fw-bold">{net.name}</div>
                          <div className="small text-muted font-mono">Chain ID: {net.chainId}</div>
                        </div>
                      </div>
                      {isSelected ? (
                        <FiCheck className="fs-5 text-white" />
                      ) : (
                        <span className="badge bg-secondary bg-opacity-25 text-dim font-mono">Select</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default NetworkModal;
