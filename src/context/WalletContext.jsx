import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import walletService from '../services/walletService';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(() => walletService.getStoredAddress() || null);
  const [pendingMnemonic, setPendingMnemonic] = useState(null);
  const [encryptedJson, setEncryptedJson] = useState(() => walletService.getStoredKeystore() || null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(() => {
    return Boolean(walletService.getStoredAddress() && walletService.getStoredKeystore());
  });

  // Temporary in-memory state exclusively during onboarding (cleared immediately upon Continue)
  const [tempWallet, setTempWallet] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);


  /**
   * Step 1 (CreatePassword): Prepares random HD wallet and stores phrase
   * for user to inspect on Recovery Phrase page.
   */
  const prepareNewWallet = (password) => {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    const mnemonic = wallet.mnemonic.phrase;

    setAddress(walletAddress);
    setPendingMnemonic(mnemonic);
    setTempWallet(wallet);
    setTempPassword(password);

    return { address: walletAddress, mnemonic };
  };

  /**
   * Step 2 (RecoveryPhrase Continue): Encrypts the wallet into standard Keystore JSON,
   * saves encrypted JSON locally, and purges plaintext mnemonic and private keys from memory.
   */
  const finalizeAndSaveWallet = async (onProgress = null) => {
    let walletToEncrypt = tempWallet;
    let passwordToUse = tempPassword;

    // Fallback if accessed directly without going through CreatePassword
    if (!walletToEncrypt) {
      if (pendingMnemonic) {
        walletToEncrypt = ethers.HDNodeWallet.fromPhrase(pendingMnemonic);
      } else {
        walletToEncrypt = ethers.Wallet.createRandom();
      }
      passwordToUse = passwordToUse || 'EtherVault2026!';
    }

    const walletAddress = walletToEncrypt.address;
    const privateKey = walletToEncrypt.privateKey;
    const mnemonicPhrase = pendingMnemonic || (walletToEncrypt.mnemonic ? walletToEncrypt.mnemonic.phrase : null);
    const callback = typeof onProgress === 'function' ? onProgress : undefined;

    // Encrypt wallet with AES-128-CTR and Scrypt KDF into standard Keystore JSON
    const encrypted = await walletToEncrypt.encrypt(passwordToUse, callback);

    // Save encrypted JSON, privateKey, mnemonic, and public address locally
    walletService.saveWalletData(walletAddress, privateKey, mnemonicPhrase, encrypted);

    // Update state
    setAddress(walletAddress);
    setEncryptedJson(encrypted);
    setIsInitialized(true);
    setIsUnlocked(true);

    // Clean up temporary in-memory credentials immediately
    setTempWallet(null);
    setTempPassword(null);
    setPendingMnemonic(null);

    return { address: walletAddress, encryptedJson: encrypted };
  };

  /**
   * One-shot wallet creation + encryption
   */
  const createWallet = async (password, onProgress = null) => {
    const result = await walletService.createWallet(password, onProgress);
    setAddress(result.address);
    setPendingMnemonic(result.mnemonic);
    setEncryptedJson(result.encryptedJson);
    setIsInitialized(true);
    setIsUnlocked(true);
    return result;
  };

  /**
   * Restores an existing wallet from a 12-word mnemonic
   */
  const importWallet = async (mnemonic, password, onProgress = null) => {
    const result = await walletService.importFromMnemonic(mnemonic, password, onProgress);
    setAddress(result.address);
    setEncryptedJson(result.encryptedJson);
    setPendingMnemonic(null);
    setIsInitialized(true);
    setIsUnlocked(true);
    return result;
  };

  /**
   * Decrypts and unlocks existing stored wallet
   */
  const unlockWallet = async (password, onProgress = null) => {
    if (!encryptedJson) throw new Error('No encrypted wallet found.');
    const result = await walletService.decryptWallet(encryptedJson, password, onProgress);
    setIsUnlocked(true);
    return result;
  };

  /**
   * Locks wallet session
   */
  const lockWallet = () => {
    setIsUnlocked(false);
    setTempWallet(null);
    setTempPassword(null);
    setPendingMnemonic(null);
  };

  /**
   * Clears all wallet data and resets state
   */
  const resetWallet = () => {
    walletService.clearStorage();
    setAddress(null);
    setPendingMnemonic(null);
    setEncryptedJson(null);
    setTempWallet(null);
    setTempPassword(null);
    setIsUnlocked(false);
    setIsInitialized(false);
  };

  const value = {
    address,
    pendingMnemonic,
    encryptedJson,
    isUnlocked,
    isInitialized,
    prepareNewWallet,
    finalizeAndSaveWallet,
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
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
