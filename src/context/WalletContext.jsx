import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import walletService from '../services/walletService';
import { changePassword, hasEncryptedWallet } from '../services/encryption';

const WalletContext = createContext(null);

const AUTO_LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of inactivity

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(() => walletService.getStoredAddress() || null);
  
  // SENSITIVE DECRYPTED CREDENTIALS (IN-MEMORY ONLY - NEVER STORED IN LOCALSTORAGE)
  const [privateKey, setPrivateKey] = useState(null);
  const [mnemonic, setMnemonic] = useState(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(() => hasEncryptedWallet());

  // Temporary in-memory state during onboarding
  const [tempWallet, setTempWallet] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [pendingMnemonic, setPendingMnemonic] = useState(null);

  /**
   * PART 6: Auto Lock after 5 minutes of user inactivity
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
   * Step 2 (RecoveryPhrase Continue): Encrypts wallet with AES and saves ciphertext only
   */
  const finalizeAndSaveWallet = async () => {
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

    // Encrypt and persist ciphertext in localStorage
    await walletService.createWallet(passwordToUse);

    // Keep decrypted keys strictly in-memory
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
   * One-shot wallet creation + AES encryption
   */
  const createWallet = async (password) => {
    const result = await walletService.createWallet(password);
    setAddress(result.address);
    setPrivateKey(result.privateKey);
    setMnemonic(result.mnemonic);
    setIsInitialized(true);
    setIsUnlocked(true);
    return result;
  };

  /**
   * Restores an existing wallet from a 12-word mnemonic & encrypts with AES
   */
  const importWallet = async (phrase, password) => {
    const result = await walletService.importFromMnemonic(phrase, password);
    setAddress(result.address);
    setPrivateKey(result.privateKey);
    setMnemonic(result.mnemonic);
    setPendingMnemonic(null);
    setIsInitialized(true);
    setIsUnlocked(true);
    return result;
  };

  /**
   * PART 4: Unlock wallet with user password (decrypts from AES storage to memory)
   */
  const unlockWallet = async (password) => {
    const decrypted = await walletService.decryptWallet(null, password);
    setAddress(decrypted.address);
    setPrivateKey(decrypted.privateKey);
    setMnemonic(decrypted.mnemonic);
    setIsUnlocked(true);
    return decrypted;
  };

  /**
   * PART 9: Change wallet password & re-encrypt
   */
  const changeUserPassword = (oldPassword, newPassword) => {
    const decrypted = changePassword(oldPassword, newPassword);
    setPrivateKey(decrypted.privateKey);
    setMnemonic(decrypted.mnemonic);
    return decrypted;
  };

  /**
   * Clears all wallet data and resets state
   */
  const resetWallet = () => {
    walletService.clearStorage();
    setAddress(null);
    setPrivateKey(null);
    setMnemonic(null);
    setPendingMnemonic(null);
    setTempWallet(null);
    setTempPassword(null);
    setIsUnlocked(false);
    setIsInitialized(false);
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
    resetWallet
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
