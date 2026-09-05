/**
 * walletService.js
 * 
 * Unified cryptographic wallet management using Ethers.js v6.
 * 
 * Storage Model:
 * Single localStorage key: "wallet"
 * Schema: { address: string, encryptedJson: string, network: "sepolia", createdAt: number }
 * 
 * Decrypted private keys and mnemonic phrases are NEVER stored in localStorage.
 * Only Keystore JSON encrypted with the user's password is saved.
 */

import { ethers } from 'ethers';

export const WALLET_STORAGE_KEY = 'wallet';

export const walletService = {
  /**
   * Reads and parses the stored wallet object from localStorage
   * @returns {{ address: string, encryptedJson: string, network: string, createdAt: number } | null}
   */
  getStoredWalletData() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(WALLET_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.address && parsed.encryptedJson) {
          return parsed;
        }
      }
      return null;
    } catch (e) {
      console.warn('Error reading stored wallet data:', e);
      return null;
    }
  },

  /**
   * Saves encrypted wallet record to localStorage
   */
  saveStoredWalletData(walletData) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));
        // Remove any old/legacy keys
        this.cleanLegacyKeys();
      }
    } catch (e) {
      console.error('Failed to save wallet to localStorage:', e);
    }
  },

  /**
   * Cleans any legacy/unencrypted keys from storage
   */
  cleanLegacyKeys() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const legacyKeys = [
      'encryptedWallet',
      'ethervault_keystore_v1',
      'ethervault_active_address',
      'ethervault_private_key',
      'ethervault_mnemonic',
      'address',
      'privateKey',
      'mnemonic',
      'mnemonic phrase'
    ];
    legacyKeys.forEach(k => window.localStorage.removeItem(k));
  },

  /**
   * Checks if an encrypted wallet is present in localStorage
   * @returns {boolean}
   */
  hasStoredWallet() {
    const data = this.getStoredWalletData();
    return Boolean(data && data.encryptedJson);
  },

  /**
   * Returns the stored public Ethereum address
   * @returns {string|null}
   */
  getStoredAddress() {
    const data = this.getStoredWalletData();
    return data ? data.address : null;
  },

  /**
   * Generates a new random HD wallet using Ethers v6,
   * encrypts it using standard Keystore JSON (wallet.encrypt),
   * and saves only { address, encryptedJson, network: "sepolia", createdAt } to localStorage.
   * 
   * @param {string} password - Master password
   * @param {function} [onProgress] - Optional encryption progress callback (0.0 to 1.0)
   * @returns {Promise<{ address: string, mnemonic: string, privateKey: string, walletData: Object }>}
   */
  async createWallet(password, onProgress = undefined) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      // 1. Generate random HD wallet
      const wallet = ethers.Wallet.createRandom();

      if (!wallet.mnemonic || !wallet.mnemonic.phrase) {
        throw new Error('Failed to generate mnemonic for HD wallet.');
      }

      const address = wallet.address;
      const mnemonic = wallet.mnemonic.phrase;
      const privateKey = wallet.privateKey;

      // 2. Encrypt using standard Ethers Keystore format
      const callback = typeof onProgress === 'function' ? onProgress : undefined;
      const encryptedJson = await wallet.encrypt(password, callback);

      // 3. Save ONLY this object to localStorage
      const walletData = {
        address,
        encryptedJson,
        network: 'sepolia',
        createdAt: Date.now()
      };

      this.saveStoredWalletData(walletData);

      return {
        address,
        mnemonic,
        privateKey,
        walletData
      };
    } catch (error) {
      console.error('Wallet creation error:', error);
      throw new Error(error.message || 'An error occurred while generating cryptographic wallet.');
    }
  },

  /**
   * Restores a wallet from a 12-word BIP39 mnemonic phrase,
   * encrypts using wallet.encrypt(password),
   * and saves only { address, encryptedJson, network: "sepolia", createdAt } to localStorage.
   * 
   * @param {string} mnemonicPhrase - 12-word BIP39 recovery phrase
   * @param {string} password - Master password
   * @param {function} [onProgress] - Optional progress callback
   * @returns {Promise<{ address: string, mnemonic: string, privateKey: string, walletData: Object }>}
   */
  async importFromMnemonic(mnemonicPhrase, password, onProgress = undefined) {
    const cleanPhrase = (mnemonicPhrase || '').trim().replace(/\s+/g, ' ');

    if (!ethers.Mnemonic.isValidMnemonic(cleanPhrase)) {
      throw new Error('Invalid 12-word BIP39 recovery phrase. Please check spelling and word order.');
    }

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      const wallet = ethers.HDNodeWallet.fromPhrase(cleanPhrase);
      const address = wallet.address;
      const privateKey = wallet.privateKey;

      const callback = typeof onProgress === 'function' ? onProgress : undefined;
      const encryptedJson = await wallet.encrypt(password, callback);

      const walletData = {
        address,
        encryptedJson,
        network: 'sepolia',
        createdAt: Date.now()
      };

      this.saveStoredWalletData(walletData);

      return {
        address,
        mnemonic: cleanPhrase,
        privateKey,
        walletData
      };
    } catch (error) {
      console.error('Wallet import error:', error);
      throw new Error(error.message || 'Failed to restore wallet from recovery phrase.');
    }
  },

  /**
   * Decrypts the stored Keystore JSON from localStorage using ethers.Wallet.fromEncryptedJson.
   * If password is wrong, throws 'Wrong Password' without crashing.
   * 
   * @param {string} password - User password
   * @param {function} [onProgress] - Optional progress callback
   * @returns {Promise<{ address: string, privateKey: string, mnemonic: string|null }>}
   */
  async decryptWallet(password, onProgress = undefined) {
    const walletData = this.getStoredWalletData();

    if (!walletData || !walletData.encryptedJson) {
      throw new Error('No wallet found. Please import or create a wallet.');
    }

    if (!password) {
      throw new Error('Wrong Password');
    }

    try {
      const callback = typeof onProgress === 'function' ? onProgress : undefined;
      const wallet = await ethers.Wallet.fromEncryptedJson(walletData.encryptedJson, password, callback);

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : null
      };
    } catch (error) {
      console.warn('Unlock attempt failed: Wrong Password', error);
      throw new Error('Wrong Password');
    }
  },

  /**
   * Re-encrypts the stored wallet with a new password
   */
  async changePassword(oldPassword, newPassword, onProgress = undefined) {
    if (!oldPassword || !newPassword) {
      throw new Error('Both current and new passwords are required.');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    // 1. Decrypt with old password
    const decrypted = await this.decryptWallet(oldPassword);

    // 2. Re-encrypt with new password
    const wallet = new ethers.Wallet(decrypted.privateKey);
    const callback = typeof onProgress === 'function' ? onProgress : undefined;
    const newEncryptedJson = await wallet.encrypt(newPassword, callback);

    const walletData = {
      address: decrypted.address,
      encryptedJson: newEncryptedJson,
      network: 'sepolia',
      createdAt: Date.now()
    };

    this.saveStoredWalletData(walletData);

    return decrypted;
  },

  /**
   * Deletes the stored wallet from localStorage
   */
  clearStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(WALLET_STORAGE_KEY);
        this.cleanLegacyKeys();
      }
    } catch (e) {
      console.warn('Error clearing wallet storage:', e);
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
