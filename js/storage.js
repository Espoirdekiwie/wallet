/**
 * storage.js
 * 
 * LocalStorage and SessionStorage Data Access Layer for EtherVault.
 * Provides persistent storage for wallet data, selected network, and temporary session variables.
 */

const WALLET_STORAGE_KEY = 'ethervault_wallet';
const TEMP_PASSWORD_KEY = 'ethervault_temp_password';
const TEMP_PHRASE_KEY = 'ethervault_temp_phrase';
const TRANSACTIONS_KEY = 'ethervault_transactions';
const NETWORK_KEY = 'ethervault_network';

/**
 * Save complete wallet data object into localStorage as JSON
 * @param {Object} walletData - Complete wallet details object
 * @returns {boolean} - Returns true on successful save
 */
function saveWallet(walletData) {
    try {
        if (!walletData || typeof walletData !== 'object') {
            throw new Error('Invalid wallet data provided to saveWallet()');
        }

        // Add metadata timestamps
        walletData.savedAt = new Date().toISOString();
        walletData.appVersion = '1.0.0';

        const serialized = JSON.stringify(walletData);
        localStorage.setItem(WALLET_STORAGE_KEY, serialized);

        console.log('✓ Wallet saved to localStorage successfully');
        return true;
    } catch (error) {
        console.error('✗ Error saving wallet to localStorage:', error.message);
        throw error;
    }
}

/**
 * Load saved wallet data from localStorage
 * @returns {Object|null} - Wallet data object or null if not found
 */
function loadWallet() {
    try {
        const serialized = localStorage.getItem(WALLET_STORAGE_KEY);
        if (!serialized) {
            return null;
        }

        const walletData = JSON.parse(serialized);
        if (!walletData || !walletData.address) {
            throw new Error('Corrupted or invalid wallet data in storage');
        }
        return walletData;
    } catch (error) {
        console.error('✗ Error loading wallet from localStorage:', error.message);
        return null;
    }
}

/**
 * Update Wallet Balance in localStorage
 * @param {string|number} newBalance - New ETH balance
 */
function updateWalletBalance(newBalance) {
    try {
        const wallet = loadWallet();
        if (wallet) {
            wallet.balance = newBalance.toString();
            saveWallet(wallet);
        }
    } catch (error) {
        console.error('✗ Error updating wallet balance:', error.message);
    }
}

/**
 * Clear all EtherVault wallet data from localStorage and sessionStorage
 * @returns {boolean} - Returns true on success
 */
function clearWallet() {
    try {
        localStorage.removeItem(WALLET_STORAGE_KEY);
        localStorage.removeItem(TRANSACTIONS_KEY);
        localStorage.removeItem(NETWORK_KEY);
        sessionStorage.clear();
        console.log('✓ Storage cleared successfully');
        return true;
    } catch (error) {
        console.error('✗ Error clearing storage:', error.message);
        throw error;
    }
}

/**
 * Helper to check if a wallet is saved in localStorage
 * @returns {boolean} - True if wallet exists
 */
function hasWallet() {
    return localStorage.getItem(WALLET_STORAGE_KEY) !== null;
}

/**
 * Network state helpers
 */
function getSelectedNetwork() {
    return localStorage.getItem(NETWORK_KEY) || 'mainnet';
}

function setSelectedNetwork(networkId) {
    localStorage.setItem(NETWORK_KEY, networkId);
}

/**
 * Session storage helpers for multi-step onboarding
 */
function saveTempPassword(password) {
    sessionStorage.setItem(TEMP_PASSWORD_KEY, password);
}

function getTempPassword() {
    return sessionStorage.getItem(TEMP_PASSWORD_KEY);
}

function clearTempPassword() {
    sessionStorage.removeItem(TEMP_PASSWORD_KEY);
}

function saveTempPhrase(phrase) {
    sessionStorage.setItem(TEMP_PHRASE_KEY, phrase);
}

function getTempPhrase() {
    return sessionStorage.getItem(TEMP_PHRASE_KEY);
}

function clearTempPhrase() {
    sessionStorage.removeItem(TEMP_PHRASE_KEY);
}

/**
 * Transactions Persistence Helpers
 */
function getTransactions() {
    try {
        const data = localStorage.getItem(TRANSACTIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        return [];
    }
}

function addTransaction(tx) {
    try {
        const txs = getTransactions();
        txs.unshift(tx);
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
        return txs;
    } catch (error) {
        return [];
    }
}

console.log('%c💾 EtherVault storage.js Module Ready', 'color: #F6851B; font-weight: bold;');
