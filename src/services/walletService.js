/**
 * walletService.js
 * 
 * Core cryptographic wallet management using ethers.js v6.
 * Generates wallets with ethers.Wallet.createRandom() or HDNodeWallet.fromPhrase(),
 * persists address, privateKey, and mnemonic phrase in localStorage,
 * and encrypts wallet to Keystore JSON.
 */

import { ethers } from 'ethers';

const STORAGE_KEY = 'ethervault_keystore_v1';
const ADDRESS_KEY = 'ethervault_active_address';
const PRIVATE_KEY = 'ethervault_private_key';
const MNEMONIC_KEY = 'ethervault_mnemonic';

export const walletService = {
  /**
   * Generates a new random HD wallet using ethers.Wallet.createRandom()
   * Encrypts the wallet with the provided password into standard Keystore JSON.
   * Stores address, privateKey, and mnemonic phrase in localStorage.
   * 
   * @param {string} password - User session password
   * @param {function} [progressCallback] - Optional encryption progress callback (0.0 to 1.0)
   * @returns {Promise<{ address: string, mnemonic: string, privateKey: string, encryptedJson: string }>}
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
      const privateKey = wallet.privateKey;

      // 2. Encrypt wallet to Keystore JSON
      const callback = typeof progressCallback === 'function' ? progressCallback : undefined;
      const encryptedJson = await wallet.encrypt(password, callback);

      // 3. Persist credentials in local storage
      this.saveWalletData(address, privateKey, mnemonic, encryptedJson);

      return {
        address,
        mnemonic,
        privateKey,
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
   * @returns {Promise<{ address: string, mnemonic: string, privateKey: string, encryptedJson: string }>}
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
      const privateKey = wallet.privateKey;
      const callback = typeof progressCallback === 'function' ? progressCallback : undefined;
      const encryptedJson = await wallet.encrypt(password, callback);

      this.saveWalletData(address, privateKey, cleanPhrase, encryptedJson);

      return {
        address,
        mnemonic: cleanPhrase,
        privateKey,
        encryptedJson
      };
    } catch (error) {
      console.error('Wallet import error:', error);
      throw new Error(error.message || 'Failed to restore wallet from recovery phrase.');
    }
  },

  /**
   * Decrypts the stored keystore JSON using the user's password.
   */
  async decryptWallet(encryptedJson, password, progressCallback = undefined) {
    if (!encryptedJson) throw new Error('No encrypted wallet found.');
    if (!password) throw new Error('Password is required to decrypt wallet.');

    try {
      const callback = typeof progressCallback === 'function' ? progressCallback : undefined;
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password, callback);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : null
      };
    } catch (error) {
      console.error('Wallet decryption error:', error);
      throw new Error('Incorrect password. Failed to decrypt wallet keystore.');
    }
  },

  /**
   * Saves wallet data to browser localStorage under standard and project keys
   */
  saveWalletData(address, privateKey, mnemonic, encryptedJson = null) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (address) {
          window.localStorage.setItem('address', address);
          window.localStorage.setItem(ADDRESS_KEY, address);
        }
        if (privateKey) {
          window.localStorage.setItem('privateKey', privateKey);
          window.localStorage.setItem(PRIVATE_KEY, privateKey);
        }
        if (mnemonic) {
          window.localStorage.setItem('mnemonic', mnemonic);
          window.localStorage.setItem('mnemonic phrase', mnemonic);
          window.localStorage.setItem(MNEMONIC_KEY, mnemonic);
        }
        if (encryptedJson) {
          window.localStorage.setItem(STORAGE_KEY, encryptedJson);
        }
      }
    } catch (err) {
      console.warn('Storage save error:', err);
    }
  },

  /**
   * Compatibility alias for saveEncryptedKeystore
   */
  saveEncryptedKeystore(address, encryptedJson, privateKey = null, mnemonic = null) {
    this.saveWalletData(address, privateKey, mnemonic, encryptedJson);
  },

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

  getStoredPrivateKey() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('privateKey') || window.localStorage.getItem(PRIVATE_KEY);
      }
      return null;
    } catch {
      return null;
    }
  },

  getStoredMnemonic() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('mnemonic') || window.localStorage.getItem(MNEMONIC_KEY) || window.localStorage.getItem('mnemonic phrase');
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
        window.localStorage.removeItem('address');
        window.localStorage.removeItem('privateKey');
        window.localStorage.removeItem('mnemonic');
        window.localStorage.removeItem('mnemonic phrase');
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(ADDRESS_KEY);
        window.localStorage.removeItem(PRIVATE_KEY);
        window.localStorage.removeItem(MNEMONIC_KEY);
      }
    } catch (err) {
      console.warn('Storage clear error:', err);
    }
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
