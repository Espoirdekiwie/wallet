export { default as walletService } from './walletService';
export { 
  default as blockchainService,
  connectProvider,
  getBalance,
  getNetwork,
  getGasPrice,
  estimateGas,
  sendTransaction,
  getTransaction,
  getHistory,
  SEPOLIA_RPC_URL,
  SEPOLIA_CHAIN_ID
} from './blockchain';
