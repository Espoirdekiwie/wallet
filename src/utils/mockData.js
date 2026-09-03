/**
 * mockData.js
 * 
 * Mock datasets and local storage helpers for transactions and wallet state.
 */

export const mockWallet = {
  name: 'Main Vault (HD)',
  address: '0x71C8411F49B90D8198fA01119B3e329B35ffe296',
  publicKey: '0x0289ab7491d90c741e98d9c72e39174b5b9c02d7491d90c741e98d9c72e39174b5',
  balanceEth: '0.0000',
  balanceUsd: '0.00',
  ethPrice: '3,250.45',
  pnl24h: '+0.00%',
  mnemonic: 'apple banana cherry dragon eagle falcon garden hammer island jungle kettle lemon'
};

export const mockTokens = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '0.0000',
    usdValue: '$0.00',
    price: '$3,250.45',
    change24h: '+0.00%',
    iconColor: '#FF6B00',
    icon: 'bi-ethereum'
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    balance: '0.00',
    usdValue: '$0.00',
    price: '$0.70',
    change24h: '+0.00%',
    iconColor: '#A855F7',
    icon: 'bi-hexagon'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '0.00',
    usdValue: '$0.00',
    price: '$1.00',
    change24h: '+0.00%',
    iconColor: '#06B6D4',
    icon: 'bi-currency-dollar'
  }
];

export const mockTransactions = [
  {
    id: 'tx-1',
    type: 'Send',
    asset: 'ETH',
    amount: '0.2500',
    usdAmount: '$812.61',
    to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
    timestamp: '15 mins ago',
    status: 'Confirmed',
    hash: '0x8f72ae4b91e32d1847c92bfa03487c95e03291847c92bfa03487c95e03291847'
  },
  {
    id: 'tx-2',
    type: 'Receive',
    asset: 'ETH',
    amount: '1.2000',
    usdAmount: '$3,900.54',
    from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    timestamp: '2 hours ago',
    status: 'Confirmed',
    hash: '0x12bc4f482847c92bfa03487c95e03291847c92bfa03487c95e03291847c92bfa0'
  }
];

const TX_STORAGE_KEY = 'ethervault_transactions_v1';

export function getStoredTransactions() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(TX_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (err) {
    console.warn('Failed to load stored transactions:', err);
  }
  return mockTransactions;
}

export function saveTransaction(newTx) {
  try {
    const existing = getStoredTransactions();
    const updated = [newTx, ...existing];
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  } catch (err) {
    console.warn('Failed to save transaction:', err);
    return [newTx, ...mockTransactions];
  }
}

export const mockNetworks = [
  { id: 'mainnet', name: 'Ethereum Mainnet', chainId: 1, color: '#FF6B00', icon: 'bi-ethereum', active: true },
  { id: 'sepolia', name: 'Sepolia Testnet', chainId: 11155111, color: '#F59E0B', icon: 'bi-vial', active: false },
  { id: 'polygon', name: 'Polygon Mainnet', chainId: 137, color: '#A855F7', icon: 'bi-hexagon', active: false },
  { id: 'arbitrum', name: 'Arbitrum One', chainId: 42161, color: '#06B6D4', icon: 'bi-layers', active: false }
];

export function shortenAddress(address, chars = 4) {
  if (!address || address.length < 10) return address || '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
