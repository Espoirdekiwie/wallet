/**
 * import.js
 * 
 * Handles wallet import functionality on the import-wallet.html page.
 * Validates recovery phrase and imports existing wallet using Ethers v6.
 */

// Live word counter
function setupWordCounter() {
    const input = document.getElementById('recoveryPhrase');
    const counter = document.getElementById('phraseWordCount');
    if (!input || !counter) return;
    input.addEventListener('input', () => {
        const words = input.value.trim().split(/\s+/).filter(w => w.length > 0);
        const count = words.length;
        counter.textContent = `${count} / 12 words`;
        counter.style.color = count === 12 ? 'var(--green)' : count > 12 ? 'var(--danger)' : 'var(--text-dim)';
    });
}

// Form elements
const importForm = document.getElementById('importForm');
const passwordInput = document.getElementById('password');
const recoveryPhraseInput = document.getElementById('recoveryPhrase');
const togglePasswordBtn = document.getElementById('togglePassword');
const importBtn = document.getElementById('importBtn');
const validationMessage = document.getElementById('validationMessage');
const loadingState = document.getElementById('loadingState');

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordBtn.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
    } else {
        passwordInput.type = 'password';
        togglePasswordBtn.innerHTML = '<i class="bi bi-eye-fill"></i>';
    }
}

/**
 * Validate recovery phrase input
 */
function validateRecoveryPhrase() {
    const phrase = recoveryPhraseInput.value.trim();

    if (!phrase) {
        return { isValid: false, message: 'Please enter your recovery phrase' };
    }

    const words = phrase.split(/\s+/).filter(w => w.length > 0);

    if (words.length !== 12) {
        return { isValid: false, message: `Invalid phrase: expected 12 words, got ${words.length}` };
    }

    if (!isValidMnemonic(phrase)) {
        return { isValid: false, message: 'Invalid recovery phrase. Please check for spelling errors.' };
    }

    return { isValid: true, message: 'Valid recovery phrase' };
}

/**
 * Validate password input
 */
function validatePassword() {
    const password = passwordInput.value;

    if (!password) {
        return { isValid: false, message: 'Please enter a password' };
    }

    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters' };
    }

    return { isValid: true, message: 'Valid password' };
}

/**
 * Show validation message
 */
function showValidationMessage(message, isSuccess) {
    if (!validationMessage) return;
    validationMessage.textContent = message;
    validationMessage.style.display = 'block';
    validationMessage.className = isSuccess ? 'alert alert-success fade-in' : 'alert alert-danger fade-in';
}

function showLoading() {
    if (loadingState) loadingState.style.display = 'block';
    if (importBtn) importBtn.disabled = true;
    if (recoveryPhraseInput) recoveryPhraseInput.disabled = true;
    if (passwordInput) passwordInput.disabled = true;
}

function hideLoading() {
    if (loadingState) loadingState.style.display = 'none';
    if (importBtn) importBtn.disabled = false;
    if (recoveryPhraseInput) recoveryPhraseInput.disabled = false;
    if (passwordInput) passwordInput.disabled = false;
}

/**
 * Handle form submission
 */
async function handleImportSubmit(e) {
    e.preventDefault();

    try {
        const phraseValidation = validateRecoveryPhrase();
        if (!phraseValidation.isValid) {
            showValidationMessage(phraseValidation.message, false);
            return;
        }

        const passwordValidation = validatePassword();
        if (!passwordValidation.isValid) {
            showValidationMessage(passwordValidation.message, false);
            return;
        }

        showLoading();
        showValidationMessage('Importing and deriving wallet keys...', true);

        const phrase = recoveryPhraseInput.value.trim();
        const password = passwordInput.value;

        // Import wallet using Ethers.js
        const walletData = await importWallet(phrase);

        // Store temp password & save wallet
        saveTempPassword(password);
        saveWallet(walletData);

        saveWalletMetadata({
            importedDate: new Date().toISOString(),
            walletType: 'imported'
        });

        console.log('✓ Wallet imported successfully');

        showValidationMessage('✓ Wallet imported successfully! Redirecting to dashboard...', true);

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1200);

    } catch (error) {
        console.error('✗ Error importing wallet:', error.message);
        hideLoading();
        showValidationMessage('Import Error: ' + error.message, false);
    }
}

function setupRealTimeValidation() {
    if (!recoveryPhraseInput) return;
    recoveryPhraseInput.addEventListener('blur', () => {
        if (recoveryPhraseInput.value.trim().length > 0) {
            const validation = validateRecoveryPhrase();
            if (!validation.isValid) {
                showValidationMessage(validation.message, false);
            } else if (validationMessage) {
                validationMessage.style.display = 'none';
            }
        }
    });
}

function initializeImportForm() {
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }

    if (importForm) {
        importForm.addEventListener('submit', handleImportSubmit);
    }

    setupRealTimeValidation();
    setupWordCounter();
    console.log('✓ Import wallet form initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeImportForm);
} else {
    initializeImportForm();
}

console.log('%c📥 EtherVault Import Module Loaded', 'color: #F6851B; font-weight: bold; font-size: 14px;');
