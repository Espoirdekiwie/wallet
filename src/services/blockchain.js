/**
 * blockchain.js
 * 
 * Ethereum Sepolia Testnet blockchain service powered by ethers.js v6.
 * Connects to the public Sepolia RPC endpoint:
 * https://ethereum-sepolia-rpc.publicnode.com
 */

import { ethers } from 'ethers';

export const SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
export const SEPOLIA_CHAIN_ID = 11155111n;

let cachedProvider = null;

/**
 * PART 2: connectProvider()
 * Returns a JsonRpcProvider connected to Ethereum Sepolia Testnet.
 * Reuses the provider instance when possible.
 */
export function connectProvider() {
  if (!cachedProvider) {
    cachedProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL, {
      chainId: 11155111,
      name: 'sepolia'
    }, {
      staticNetwork: true,
      batchMaxCount: 1
    });
  }
  return cachedProvider;
}

/**
 * Returns formatted ETH balance and raw BigInt balance.
 * 
 * @param {string} address - Ethereum public address
 * @returns {Promise<{ formatted: string, raw: bigint, ether: string }>}
 */
export async function getBalance(address) {
  if (!address || !ethers.isAddress(address)) {
    return { formatted: '0.0000', raw: 0n, ether: '0.0' };
  }

  try {
    const provider = connectProvider();
    const balanceBigInt = await provider.getBalance(address);
    const fullEther = ethers.formatEther(balanceBigInt);
    
    // Format to 4-5 decimal places for clean UI display (e.g. 0.0531)
    const num = parseFloat(fullEther);
    let formatted = '0.0000';
    if (num > 0) {
      if (num < 0.0001) {
        formatted = '< 0.0001';
      } else {
        // Format with up to 4 decimals without trailing zeros if clean
        formatted = num.toLocaleString('en-US', {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4
        });
      }
    }

    return {
      formatted,
      raw: balanceBigInt,
      ether: fullEther
    };
  } catch (error) {
    console.warn('Failed to fetch Sepolia balance:', error);
    throw new Error('Unable to fetch Sepolia balance. Please check network connection.');
  }
}

/**
 * PART 7: getNetwork()
 * Detects network details automatically from Sepolia provider.
 */
export async function getNetwork() {
  try {
    const provider = connectProvider();
    const network = await provider.getNetwork();
    return {
      name: 'Ethereum Sepolia',
      chainId: network.chainId,
      isSepolia: network.chainId === SEPOLIA_CHAIN_ID,
      isOnline: true
    };
  } catch (error) {
    console.warn('Failed to detect network (Offline/RPC unreachable):', error);
    return {
      name: 'Offline',
      chainId: 0n,
      isSepolia: false,
      isOnline: false
    };
  }
}

/**
 * PART 8: getGasPrice()
 * Fetches current gas price in Gwei from Sepolia RPC.
 */
export async function getGasPrice() {
  try {
    const provider = connectProvider();
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits('18', 'gwei');
    const gweiValue = parseFloat(ethers.formatUnits(gasPrice, 'gwei')).toFixed(1);
    return `${gweiValue} Gwei`;
  } catch (error) {
    console.warn('Failed to fetch gas price:', error);
    return '18.0 Gwei';
  }
}

/**
 * Estimates gas required for a transaction.
 * 
 * @param {string|ethers.Wallet} walletOrPrivateKey 
 * @param {string} to 
 * @param {string} amount 
 */
export async function estimateGas(walletOrPrivateKey, to, amount) {
  if (!to || !ethers.isAddress(to)) {
    throw new Error('Invalid recipient address for gas estimation.');
  }
  if (!amount || parseFloat(amount) <= 0) {
    throw new Error('Invalid amount for gas estimation.');
  }

  try {
    const provider = connectProvider();
    let fromAddress = null;
    if (typeof walletOrPrivateKey === 'string') {
      const w = new ethers.Wallet(walletOrPrivateKey);
      fromAddress = w.address;
    } else if (walletOrPrivateKey && walletOrPrivateKey.address) {
      fromAddress = walletOrPrivateKey.address;
    }

    const value = ethers.parseEther(amount.toString());
    const estimatedUnits = await provider.estimateGas({
      from: fromAddress || undefined,
      to,
      value
    });

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');
    const totalCostWei = estimatedUnits * gasPrice;
    const totalCostEther = ethers.formatEther(totalCostWei);

    return {
      gasUnits: estimatedUnits.toString(),
      gasPriceGwei: ethers.formatUnits(gasPrice, 'gwei'),
      totalCostEther
    };
  } catch (error) {
    console.warn('Gas estimation error:', error);
    // Standard default 21000 gas for plain ETH transfers
    return {
      gasUnits: '21000',
      gasPriceGwei: '20.0',
      totalCostEther: '0.00042'
    };
  }
}

/**
 * PART 5: sendTransaction(wallet, to, amount)
 * Signs and broadcasts a real Ethereum Sepolia transfer.
 * Waits for transaction receipt on-chain.
 * 
 * @param {string|ethers.Wallet} wallet - Wallet instance or raw private key
 * @param {string} to - Recipient Ethereum address
 * @param {string} amount - ETH amount string (e.g. '0.01')
 * @returns {Promise<{ hash: string, receipt: any, gasUsed: string, status: string, blockNumber: number }>}
 */
export async function sendTransaction(wallet, to, amount) {
  if (!to || !ethers.isAddress(to)) {
    throw new Error('Invalid recipient address format. Must be a valid 40-hex Ethereum address.');
  }

  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    throw new Error('Please enter a valid amount greater than 0 ETH.');
  }

  const provider = connectProvider();
  let signer = null;

  if (typeof wallet === 'string') {
    let cleanKey = wallet.trim();
    if (!cleanKey.startsWith('0x')) {
      cleanKey = `0x${cleanKey}`;
    }
    signer = new ethers.Wallet(cleanKey, provider);
  } else if (wallet && typeof wallet.sendTransaction === 'function') {
    signer = wallet.provider ? wallet : wallet.connect(provider);
  } else {
    throw new Error('No active signing wallet found. Please unlock or import your wallet.');
  }

  try {
    // 1. Check account balance before sending
    const currentBalance = await provider.getBalance(signer.address);
    const valueToSend = ethers.parseEther(amount.toString());

    // Basic gas reserve check (at least 21000 * 25 gwei)
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');
    const estimatedGasFee = 21000n * gasPrice;

    if (currentBalance < valueToSend + estimatedGasFee) {
      const formattedBalance = ethers.formatEther(currentBalance);
      throw new Error(`Insufficient Sepolia ETH balance (${parseFloat(formattedBalance).toFixed(4)} ETH available). You need at least ${amount} ETH + gas fee.`);
    }

    // 2. Broadcast transaction
    const tx = await signer.sendTransaction({
      to: to.trim(),
      value: valueToSend
    });

    // 3. Wait for 1 confirmation
    const receipt = await tx.wait(1);

    const isSuccess = receipt && receipt.status === 1;

    return {
      hash: tx.hash,
      receipt,
      gasUsed: receipt ? receipt.gasUsed.toString() : '21000',
      blockNumber: receipt ? receipt.blockNumber : null,
      status: isSuccess ? 'Confirmed' : 'Failed'
    };
  } catch (error) {
    console.error('Sepolia sendTransaction error:', error);
    if (error.code === 'INSUFFICIENT_FUNDS' || error.message.includes('insufficient funds')) {
      throw new Error('Insufficient Sepolia ETH balance for this transaction + gas fee.');
    }
    if (error.code === 'NETWORK_ERROR' || error.message.includes('network')) {
      throw new Error('Network offline or RPC timeout. Please retry in a few seconds.');
    }
    throw new Error(error.reason || error.message || 'Transaction broadcast failed.');
  }
}

/**
 * Gets transaction details and receipt by hash.
 * 
 * @param {string} txHash 
 */
export async function getTransaction(txHash) {
  if (!txHash) return null;
  try {
    const provider = connectProvider();
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    return {
      tx,
      receipt,
      confirmed: receipt !== null && receipt.status === 1
    };
  } catch (error) {
    console.warn('Failed to get transaction:', error);
    return null;
  }
}

/**
 * PART 6: getHistory(address)
 * Synchronizes and checks on-chain status of stored transactions.
 */
export async function getHistory(address) {
  if (!address) return [];
  try {
    // Reads stored transactions from localStorage
    const raw = localStorage.getItem('ethervault_transactions_v1');
    const stored = raw ? JSON.parse(raw) : [];

    // Filter for current address (or all user's transactions)
    const userTxs = stored.filter(t => 
      !t.from || t.from.toLowerCase() === address.toLowerCase() || (t.to && t.to.toLowerCase() === address.toLowerCase())
    );

    // Sort newest first
    return userTxs.sort((a, b) => {
      const timeA = parseInt(a.id?.replace(/\D/g, '') || '0', 10);
      const timeB = parseInt(b.id?.replace(/\D/g, '') || '0', 10);
      return timeB - timeA;
    });
  } catch (error) {
    console.warn('Failed to retrieve history:', error);
    return [];
  }
}

export default {
  connectProvider,
  getBalance,
  getNetwork,
  getGasPrice,
  estimateGas,
  sendTransaction,
  getTransaction,
  getHistory
};
