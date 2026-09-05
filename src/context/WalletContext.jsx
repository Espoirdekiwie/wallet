import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import walletService from '../services/walletService';

const WalletContext = createContext(null);

const AUTO_LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of inactivity

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(() => walletService.getStoredAddress() || null);
  
  // IN-MEMORY ONLY CREDENTIALS (NEVER PERSISTED IN PLAINTEXT)
  const [privateKey, setPrivateKey] = useState(null);
  const [mnemonic, setMnemonic] = useState(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(() => walletService.hasStoredWallet());

  // Temporary in-memory state during onboarding
  const [tempWallet, setTempWallet] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [pendingMnemonic, setPendingMnemonic] = useState(null);

  /**
   * Auto Lock after 5 minutes of user inactivity
   */
  const lockWallet = useCallback(() => {
    setPrivateKey(null);
    setMnemonic(null);
    setTempWallet(null);
    setTempPassword(null);
    setPendingMnemonic(null);
    setIsUnlocked(false);
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

    let timer = null;

    const handleUserActivity = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        lockWallet();
      }, AUTO_LOCK_TIMEOUT_MS);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    handleUserActivity();

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [isUnlocked, lockWallet]);

  /**
   * Step 1 (CreatePassword): Prepares random HD wallet in memory
   */
  const prepareNewWallet = (password) => {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    const mnemonicPhrase = wallet.mnemonic.phrase;

    setAddress(walletAddress);
    setPendingMnemonic(mnemonicPhrase);
    setTempWallet(wallet);
    setTempPassword(password);

    return { address: walletAddress, mnemonic: mnemonicPhrase };
  };

  /**
   * Step 2 (RecoveryPhrase Continue): Encrypts wallet using wallet.encrypt(password)
   * and saves only { address, encryptedJson, network: "sepolia", createdAt } to localStorage.
   */
  const finalizeAndSaveWallet = async (onProgress = undefined) => {
    let walletToEncrypt = tempWallet;
    let passwordToUse = tempPassword;

    if (!walletToEncrypt) {
      if (pendingMnemonic) {
        walletToEncrypt = ethers.HDNodeWallet.fromPhrase(pendingMnemonic);
      } else {
        walletToEncrypt = ethers.Wallet.createRandom();
      }
      passwordToUse = passwordToUse || 'EtherVault2026!';
    }

    const walletAddress = walletToEncrypt.address;
    const rawPrivateKey = walletToEncrypt.privateKey;
    const mnemonicPhrase = pendingMnemonic || (walletToEncrypt.mnemonic ? walletToEncrypt.mnemonic.phrase : null);

    // Encrypt with Ethers Keystore
    const callback = typeof onProgress === 'function' ? onProgress : undefined;
    const encryptedJson = await walletToEncrypt.encrypt(passwordToUse, callback);

    const walletData = {
      address: walletAddress,
      encryptedJson,
      network: 'sepolia',
      createdAt: Date.now()
    };

    walletService.saveStoredWalletData(walletData);

    // Keep decrypted keys in-memory for immediate active session
    setAddress(walletAddress);
    setPrivateKey(rawPrivateKey);
    setMnemonic(mnemonicPhrase);
    setIsInitialized(true);
    setIsUnlocked(true);

    // Clean up onboarding state
    setTempWallet(null);
    setTempPassword(null);
    setPendingMnemonic(null);

    return { address: walletAddress };
  };

  /**
   * One-shot wallet creation + encryption
   */
  const createWallet = async (password, onProgress = undefined) => {
    const result = await walletService.createWallet(password, onProgress);
    setAddress(result.address);
    setPrivateKey(result.privateKey);
    setMnemonic(result.mnemonic);
    setIsInitialized(true);
    setIsUnlocked(true);
    return result;
  };

  /**
   * Restores an existing wallet from a 12-word mnemonic & encrypts with password
   */
  const importWallet = async (phrase, password, onProgress = undefined) => {
    const result = await walletService.importFromMnemonic(phrase, password, onProgress);
    setAddress(result.address);
    setPrivateKey(result.privateKey);
    setMnemonic(result.mnemonic);
    setPendingMnemonic(null);
    setIsInitialized(true);
    setIsUnlocked(true);
    return result;
  };

  /**
   * Unlock wallet with user password (decrypts from Keystore JSON into memory)
   */
  const unlockWallet = async (password, onProgress = undefined) => {
    const decrypted = await walletService.decryptWallet(password, onProgress);
    setAddress(decrypted.address);
    setPrivateKey(decrypted.privateKey);
    setMnemonic(decrypted.mnemonic);
    setIsUnlocked(true);
    setIsInitialized(true);
    return decrypted;
  };

  /**
   * Change wallet password & re-encrypt
   */
  const changeUserPassword = async (oldPassword, newPassword, onProgress = undefined) => {
    const decrypted = await walletService.changePassword(oldPassword, newPassword, onProgress);
    setPrivateKey(decrypted.privateKey);
    setMnemonic(decrypted.mnemonic);
    return decrypted;
  };

  /**
   * Logout / Reset: Clears stored wallet and all memory state
   */
  const resetWallet = () => {
    walletService.clearStorage();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('ethervault_transactions_v1');
      }
    } catch {
      // ignore
    }
    setAddress(null);
    setPrivateKey(null);
    setMnemonic(null);
    setPendingMnemonic(null);
    setTempWallet(null);
    setTempPassword(null);
    setIsUnlocked(false);
    setIsInitialized(false);
  };

  const logout = () => {
    resetWallet();
  };

  const value = {
    address,
    privateKey,
    mnemonic,
    pendingMnemonic,
    isUnlocked,
    isInitialized,
    prepareNewWallet,
    finalizeAndSaveWallet,
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
    changeUserPassword,
    resetWallet,
    logout
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export default WalletContext;
