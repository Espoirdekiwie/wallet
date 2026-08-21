/**
 * wallet.js
 * 
 * Expert Blockchain Developer Implementation for EtherVault.
 * Core wallet functionality powered by Ethers.js (v6).
 * Handles wallet creation, mnemonic import, key derivation, and validation.
 */

/**
 * Create a new random Ethereum wallet using Ethers.js v6
 * Generates a 12-word BIP39 secret recovery phrase
 * @returns {Promise<Object>} - Object containing complete wallet parameters
 */
async function createWallet() {
    try {
        console.log('Generating random Ethereum HD wallet...');

        // Generate a random wallet using ethers v6
        const wallet = ethers.Wallet.createRandom();

        const walletData = {
            address: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic.phrase,
            derivationPath: wallet.mnemonic.path || "m/44'/60'/0'/0/0",
            network: 'Ethereum Mainnet',
            chainId: 1,
            createdAt: new Date().toISOString(),
            balance: '0.0000', // Default balance for initial view
            type: 'EOA'
        };

        console.log('✓ Wallet created successfully:', walletData.address);
        return walletData;
    } catch (error) {
        console.error('✗ Error in createWallet():', error.message);
        throw new Error('Wallet creation failed: ' + error.message);
    }
}

/**
 * Import an existing Ethereum wallet using a 12-word recovery phrase
 * @param {string} mnemonicPhrase - 12 space-separated recovery words
 * @returns {Promise<Object>} - Imported wallet parameters object
 */
async function importWallet(mnemonicPhrase) {
    try {
        console.log('Importing wallet from mnemonic phrase...');

        if (!mnemonicPhrase || typeof mnemonicPhrase !== 'string') {
            throw new Error('Mnemonic phrase must be a valid non-empty string.');
        }

        const cleanedPhrase = mnemonicPhrase.trim().toLowerCase();
        const words = cleanedPhrase.split(/\s+/).filter(w => w.length > 0);

        if (words.length !== 12) {
            throw new Error(`Invalid recovery phrase length: expected 12 words, got ${words.length}`);
        }

        // Import using ethers.Wallet.fromPhrase in Ethers v6
        const wallet = ethers.Wallet.fromPhrase(cleanedPhrase);

        const walletData = {
            address: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : cleanedPhrase,
            derivationPath: wallet.mnemonic ? wallet.mnemonic.path : "m/44'/60'/0'/0/0",
            network: 'Ethereum Mainnet',
            chainId: 1,
            createdAt: new Date().toISOString(),
            balance: '0.0000',
            imported: true,
            type: 'EOA'
        };

        console.log('✓ Wallet imported successfully:', walletData.address);
        return walletData;
    } catch (error) {
        console.error('✗ Error in importWallet():', error.message);
        throw new Error('Wallet import failed: ' + error.message);
    }
}

/**
 * Get wallet address from wallet data object
 * @param {Object} walletData - Wallet data object
 * @returns {string} - Full Ethereum address
 */
function getAddress(walletData) {
    if (!walletData || !walletData.address) {
        throw new Error('Invalid wallet data provided to getAddress()');
    }
    return walletData.address;
}

/**
 * Get mnemonic recovery phrase from wallet data object
 * @param {Object} walletData - Wallet data object
 * @returns {string} - 12-word secret recovery phrase
 */
function getMnemonic(walletData) {
    if (!walletData || !walletData.mnemonic) {
        return 'No recovery phrase available for this account';
    }
    return walletData.mnemonic;
}

/**
 * Get private key from wallet data object
 * @param {Object} walletData - Wallet data object
 * @returns {string} - Private key string (0x...)
 */
function getPrivateKey(walletData) {
    if (!walletData || !walletData.privateKey) {
        throw new Error('Invalid wallet data provided to getPrivateKey()');
    }
    return walletData.privateKey;
}

/**
 * Shorten Ethereum address for UI display (e.g. 0x1234...5678)
 * @param {string} address - Full 42-character Ethereum address
 * @param {number} chars - Characters to display on left and right ends (default 6)
 * @returns {string} - Formatted shortened address string
 */
function shortenAddress(address, chars = 6) {
    if (!address || typeof address !== 'string' || address.length < 10) {
        return address || '';
    }
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Validate Ethereum address string
 * @param {string} address - Address string to validate
 * @returns {boolean} - True if valid checksummed or lowercase Ethereum address
 */
function isValidAddress(address) {
    try {
        if (!address || typeof address !== 'string') return false;
        return ethers.isAddress(address);
    } catch (error) {
        return false;
    }
}

/**
 * Validate BIP39 recovery phrase
 * @param {string} phrase - 12-word mnemonic phrase
 * @returns {boolean} - True if valid BIP39 phrase
 */
function isValidMnemonic(phrase) {
    try {
        if (!phrase || typeof phrase !== 'string') return false;
        const cleaned = phrase.trim().toLowerCase();
        const words = cleaned.split(/\s+/).filter(w => w.length > 0);
        if (words.length !== 12) return false;

        return ethers.Mnemonic.isValidMnemonic(cleaned);
    } catch (error) {
        return false;
    }
}

console.log('%c🪙 EtherVault wallet.js Module Ready', 'color: #F6851B; font-weight: bold;');
