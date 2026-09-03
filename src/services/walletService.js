/**
 * walletService.js
 * 
 * Cryptographic wallet generation and management using ethers.js v6
 * and AES encryption via encryption.js.
 * 
 * Sensitive keys (privateKey, mnemonic) are encrypted before saving
 * and never stored unencrypted in localStorage.
 */

import { ethers } from 'ethers';
import { 
  encryptWallet, 
  decryptWallet, 
  hasEncryptedWallet, 
  clearEncryptedWallet,
  ADDRESS_KEY 
} from './encryption';

export const walletService = {
  /**
   * Generates a new random HD wallet using ethers.Wallet.createRandom().
   * Encrypts the wallet payload with AES using the user password.
   * Only the ciphertext is stored in localStorage under 'encryptedWallet'.
   * 
   * @param {string} password - Master password (min 8 chars)
   * @returns {Promise<{ address: string, mnemonic: string, privateKey: string, encryptedWallet: string }>}
   */
  async createWallet(password) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      const wallet = ethers.Wallet.createRandom();

      if (!wallet.mnemonic || !wallet.mnemonic.phrase) {
        throw new Error('Failed to generate mnemonic entropy for HD wallet.');
      }

      const address = wallet.address;
      const mnemonic = wallet.mnemonic.phrase;
      const privateKey = wallet.privateKey;

      // Encrypt with AES and persist only the ciphertext
      const encryptedWallet = encryptWallet({ address, privateKey, mnemonic }, password);

      return {
        address,
        mnemonic,
        privateKey,
        encryptedWallet
      };
    } catch (error) {
      console.error('Wallet creation error:', error);
      throw new Error(error.message || 'An error occurred while generating the cryptographic wallet.');
    }
  },

  /**
   * Restores a wallet from a 12-word BIP39 mnemonic and encrypts with password.
   * 
   * @param {string} mnemonicPhrase - 12-word recovery phrase
   * @param {string} password - Master password
   * @returns {Promise<{ address: string, mnemonic: string, privateKey: string, encryptedWallet: string }>}
   */
  async importFromMnemonic(mnemonicPhrase, password) {
    const cleanPhrase = mnemonicPhrase.trim().replace(/\s+/g, ' ');

    if (!ethers.Mnemonic.isValidMnemonic(cleanPhrase)) {
      throw new Error('Invalid 12-word BIP39 recovery phrase. Please check word spelling.');
    }

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      const wallet = ethers.HDNodeWallet.fromPhrase(cleanPhrase);
      const address = wallet.address;
      const privateKey = wallet.privateKey;

      const encryptedWallet = encryptWallet({ address, privateKey, mnemonic: cleanPhrase }, password);

      return {
        address,
        mnemonic: cleanPhrase,
        privateKey,
        encryptedWallet
      };
    } catch (error) {
      console.error('Wallet import error:', error);
      throw new Error(error.message || 'Failed to restore wallet from recovery phrase.');
    }
  },

  /**
   * Decrypts the stored AES encrypted wallet with user password.
   * 
   * @param {string|null} cipher - Ciphertext string or null to read from storage
   * @param {string} password - Master password
   * @returns {Promise<{ address: string, privateKey: string, mnemonic: string|null }>}
   */
  async decryptWallet(cipher, password) {
    return decryptWallet(cipher, password);
  },

  /**
   * Checks if an encrypted wallet exists in storage
   */
  hasStoredWallet() {
    return hasEncryptedWallet();
  },

  /**
   * Gets public active address
   */
  getStoredAddress() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(ADDRESS_KEY) || window.localStorage.getItem('address');
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Clears all stored wallet credentials
   */
  clearStorage() {
    clearEncryptedWallet();
  },

  isValidAddress(address) {
    return ethers.isAddress(address);
  },

  isValidMnemonic(phrase) {
    if (!phrase) return false;
    const clean = phrase.trim().replace(/\s+/g, ' ');
    return ethers.Mnemonic.isValidMnemonic(clean);
  }
};

export default walletService;
