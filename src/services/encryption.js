/**
 * encryption.js
 * 
 * AES Wallet Encryption service using crypto-js.
 * Encrypts sensitive wallet credentials (privateKey, mnemonic, address)
 * before persisting to localStorage under 'encryptedWallet'.
 * 
 * Never saves plaintext private keys or mnemonic phrases to storage.
 */

import CryptoJS from 'crypto-js';

export const ENCRYPTED_WALLET_KEY = 'encryptedWallet';
export const LEGACY_STORAGE_KEY = 'ethervault_keystore_v1';
export const ADDRESS_KEY = 'ethervault_active_address';

/**
 * Encrypts a wallet object using AES and saves to localStorage.
 * 
 * @param {Object} wallet - { address, privateKey, mnemonic }
 * @param {string} password - User master password
 * @returns {string} - AES Ciphertext string
 */
export function encryptWallet(wallet, password) {
  if (!wallet || !password) {
    throw new Error('Wallet data and password are required for encryption.');
  }

  const payload = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic || null,
    createdAt: Date.now()
  };

  const cipher = CryptoJS.AES.encrypt(JSON.stringify(payload), password).toString();

  // Persist only the ciphertext in localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(ENCRYPTED_WALLET_KEY, cipher);
    // Public non-sensitive active address for quick UI header identification
    if (wallet.address) {
      window.localStorage.setItem(ADDRESS_KEY, wallet.address);
      window.localStorage.setItem('address', wallet.address);
    }
    // Cleanse any legacy/plaintext sensitive keys from localStorage
    window.localStorage.removeItem('privateKey');
    window.localStorage.removeItem('mnemonic');
    window.localStorage.removeItem('mnemonic phrase');
    window.localStorage.removeItem('ethervault_private_key');
    window.localStorage.removeItem('ethervault_mnemonic');
  }

  return cipher;
}

/**
 * Decrypts an encrypted wallet ciphertext with the user password.
 * 
 * @param {string} cipher - AES ciphertext (optional if in localStorage)
 * @param {string} password - User master password
 * @returns {{ address: string, privateKey: string, mnemonic: string|null }}
 */
export function decryptWallet(cipher, password) {
  const cipherText = cipher || (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(ENCRYPTED_WALLET_KEY) : null);

  if (!cipherText) {
    throw new Error('No encrypted wallet found.');
  }

  if (!password) {
    throw new Error('Wrong Password');
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, password);
    const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedJson) {
      throw new Error('Wrong Password');
    }

    const wallet = JSON.parse(decryptedJson);

    if (!wallet || !wallet.address || !wallet.privateKey) {
      throw new Error('Wrong Password');
    }

    return wallet;
  } catch (error) {
    console.warn('Wallet decryption failed:', error.message);
    throw new Error('Wrong Password');
  }
}

/**
 * Re-encrypts the stored wallet with a new password.
 * 
 * @param {string} oldPassword - Current user password
 * @param {string} newPassword - New user password
 * @returns {Object} - Decrypted wallet
 */
export function changePassword(oldPassword, newPassword) {
  if (!oldPassword || !newPassword) {
    throw new Error('Both old and new passwords are required.');
  }

  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  // 1. Verify and decrypt with old password
  const wallet = decryptWallet(null, oldPassword);

  // 2. Encrypt and save with new password
  encryptWallet(wallet, newPassword);

  return wallet;
}

/**
 * Checks if an encrypted wallet exists in storage
 */
export function hasEncryptedWallet() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return Boolean(
      window.localStorage.getItem(ENCRYPTED_WALLET_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY)
    );
  }
  return false;
}

/**
 * Gets encrypted wallet ciphertext
 */
export function getEncryptedWallet() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(ENCRYPTED_WALLET_KEY);
  }
  return null;
}

/**
 * Purges encrypted wallet and credentials from storage
 */
export function clearEncryptedWallet() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(ENCRYPTED_WALLET_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.localStorage.removeItem(ADDRESS_KEY);
    window.localStorage.removeItem('address');
    window.localStorage.removeItem('privateKey');
    window.localStorage.removeItem('mnemonic');
    window.localStorage.removeItem('mnemonic phrase');
    window.localStorage.removeItem('ethervault_private_key');
    window.localStorage.removeItem('ethervault_mnemonic');
  }
}

export default {
  encryptWallet,
  decryptWallet,
  changePassword,
  hasEncryptedWallet,
  getEncryptedWallet,
  clearEncryptedWallet,
  ENCRYPTED_WALLET_KEY
};
