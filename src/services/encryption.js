/**
 * encryption.js
 * 
 * Compatibility layer redirecting to walletService.js standard Ethers Keystore encryption.
 */

import walletService from './walletService';

export const encryptWallet = (wallet, password) => walletService.createWallet(password);
export const decryptWallet = (cipher, password) => walletService.decryptWallet(password);
export const changePassword = (oldPassword, newPassword) => walletService.changePassword(oldPassword, newPassword);
export const hasEncryptedWallet = () => walletService.hasStoredWallet();
export const getEncryptedWallet = () => walletService.getStoredWalletData();
export const clearEncryptedWallet = () => walletService.clearStorage();

export default {
  encryptWallet,
  decryptWallet,
  changePassword,
  hasEncryptedWallet,
  getEncryptedWallet,
  clearEncryptedWallet
};
