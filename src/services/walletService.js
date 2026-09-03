/**
 * walletService.js
 * 
 * Core cryptographic wallet management using ethers.js v6.
 * Generates wallets with ethers.Wallet.createRandom(), extracts address,
 * 12-word BIP39 mnemonic phrase, and encrypts wallet to Keystore JSON.
 * Private key is never exposed or returned to the UI.
 */

import { ethers } from 'ethers';

const STORAGE_KEY = 'ethervault_keystore_v1';
const ADDRESS_KEY = 'ethervault_active_address';

export const walletService = {
  /**
   * Generates a new random HD wallet using ethers.Wallet.createRandom()
   * Encrypts the wallet with the provided password into standard Keystore JSON.
   * Never exposes or logs the raw private key.
   * 
   * @param {string} password - User session password
   * @param {function} [progressCallback] - Optional encryption progress callback (0.0 to 1.0)
   * @returns {Promise<{ address: string, mnemonic: string, encryptedJson: string }>}
   */
  async createWallet(password, progressCallback = undefined) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      // 1. Generate random HD wallet
      const wallet = ethers.Wallet.createRandom();

      if (!wallet.mnemonic || !wallet.mnemonic.phrase) {
        throw new Error('Failed to generate mnemonic entropy for HD wallet.');
      }

      const address = wallet.address;
      const mnemonic = wallet.mnemonic.phrase;

      // 2. Encrypt wallet to Keystore JSON
      const callback = typeof progressCallback === 'function' ? progressCallback : undefined;
      const encryptedJson = await wallet.encrypt(password, callback);

      // 3. Persist encrypted keystore and public address to local storage
      this.saveEncryptedKeystore(address, encryptedJson);

      // Return address, mnemonic, and encryptedJson (NO privateKey)
      return {
        address,
        mnemonic,
        encryptedJson
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
   * @param {string} password - User password
   * @param {function} [progressCallback] - Optional encryption progress callback
   * @returns {Promise<{ address: string, encryptedJson: string }>}
   */
  async importFromMnemonic(mnemonicPhrase, password, progressCallback = undefined) {
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
      const callback = typeof progressCallback === 'function' ? progressCallback : undefined;
      const encryptedJson = await wallet.encrypt(password, callback);

      this.saveEncryptedKeystore(address, encryptedJson);

      return {
        address,
        encryptedJson
      };
    } catch (error) {
      console.error('Wallet import error:', error);
      throw new Error(error.message || 'Failed to restore wallet from recovery phrase.');
    }
  },

  /**
   * Decrypts the stored keystore JSON using the user's password.
   * 
   * @param {string} encryptedJson - Keystore JSON string
   * @param {string} password - User password
   * @param {function} [progressCallback] - Optional decryption progress callback
   * @returns {Promise<{ address: string, mnemonic: string|null }>}
   */
  async decryptWallet(encryptedJson, password, progressCallback = undefined) {
    if (!encryptedJson) throw new Error('No encrypted wallet found.');
    if (!password) throw new Error('Password is required to decrypt wallet.');

    try {
      const callback = typeof progressCallback === 'function' ? progressCallback : undefined;
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password, callback);
      return {
        address: wallet.address,
        mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : null
      };
    } catch (error) {
      console.error('Wallet decryption error:', error);
      throw new Error('Incorrect password. Failed to decrypt wallet keystore.');
    }
  },

  /**
   * Saves encrypted Keystore JSON and public address to browser storage
   */
  saveEncryptedKeystore(address, encryptedJson) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(ADDRESS_KEY, address);
        window.localStorage.setItem(STORAGE_KEY, encryptedJson);
      }
    } catch (err) {
      console.warn('Storage error:', err);
    }
  },

  /**
   * Loads the encrypted Keystore JSON from browser storage
   */
  getStoredKeystore() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY);
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Loads the active public address from browser storage
   */
  getStoredAddress() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(ADDRESS_KEY);
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Clears stored wallet credentials
   */
  clearStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(ADDRESS_KEY);
      }
    } catch (err) {
      console.warn('Storage clear error:', err);
    }
  },

  /**
   * Validates an Ethereum address
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  },

  /**
   * Validates a BIP39 mnemonic phrase
   */
  isValidMnemonic(phrase) {
    if (!phrase) return false;
    const clean = phrase.trim().replace(/\s+/g, ' ');
    return ethers.Mnemonic.isValidMnemonic(clean);
  }
};

export default walletService;
