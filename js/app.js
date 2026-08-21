/**
 * app.js
 * 
 * Main EtherVault Application Controller.
 * Handles Recovery Phrase Generation (Page 3) and Recovery Phrase Confirmation (Page 4).
 */

// Global State
let generatedWalletData = null;
let targetWords = [];      // Original 12 words in correct order
let selectedWords = [];    // User selected words in current order
let wordPool = [];         // Shuffled 12 words for pool buttons

/**
 * PAGE 3: RECOVERY PHRASE GENERATION LOGIC
 */
async function initializeRecoveryPhrasePage() {
    const phraseGrid = document.getElementById('phraseGrid');
    if (!phraseGrid) return; // Exit if not on recovery-phrase.html

    console.log('Initializing Recovery Phrase Page (Page 3)...');

    const copyBtn = document.getElementById('copyPhraseBtn');
    const downloadBtn = document.getElementById('downloadPhraseBtn');
    const acknowledgeCheckbox = document.getElementById('acknowledgePhrase');
    const continueBtn = document.getElementById('continueBtn');
    const loadingState = document.getElementById('loadingState');
    const phraseContainer = document.getElementById('phraseContainer');

    try {
        if (loadingState) loadingState.style.display = 'block';
        if (phraseContainer) phraseContainer.style.display = 'none';

        // Generate a new random Ethereum HD wallet using ethers.js
        generatedWalletData = await createWallet();

        // Save phrase temporarily in sessionStorage for verification step
        saveTempPhrase(generatedWalletData.mnemonic);

        // Render 12-word 3x4 Grid
        const words = generatedWalletData.mnemonic.split(' ');
        phraseGrid.innerHTML = '';

        words.forEach((word, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-6';

            const card = document.createElement('div');
            card.className = 'card word-card p-3 text-center border shadow-sm fade-in';
            card.innerHTML = `
                <span class="badge bg-warning bg-opacity-10 text-warning mb-1 font-monospace">#${index + 1}</span>
                <div class="fw-bold font-monospace fs-5 text-white">${word}</div>
            `;

            col.appendChild(card);
            phraseGrid.appendChild(col);
        });

        if (loadingState) loadingState.style.display = 'none';
        if (phraseContainer) phraseContainer.style.display = 'block';

        // Event Listener: Copy Phrase
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                await navigator.clipboard.writeText(generatedWalletData.mnemonic);
                const copyAlert = document.getElementById('copyAlert');
                if (copyAlert) {
                    copyAlert.style.display = 'block';
                    setTimeout(() => copyAlert.style.display = 'none', 2500);
                }
            });
        }

        // Event Listener: Download Phrase File
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const text = `EtherVault Recovery Phrase\n----------------------------------------\nGenerated: ${new Date().toLocaleString()}\nAddress: ${generatedWalletData.address}\n\n12-Word Recovery Phrase:\n${generatedWalletData.mnemonic}\n----------------------------------------\nKEEP THIS FILE SECURE AND OFFLINE!`;
                const blob = new Blob([text], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `ethervault-backup-${generatedWalletData.address.slice(0, 8)}.txt`;
                link.click();
            });
        }

        // Event Listener: Acknowledge Checkbox
        if (acknowledgeCheckbox && continueBtn) {
            acknowledgeCheckbox.addEventListener('change', () => {
                continueBtn.disabled = !acknowledgeCheckbox.checked;
            });
        }

        // Event Listener: Continue to Verification
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                if (acknowledgeCheckbox.checked) {
                    window.location.href = 'confirm-phrase.html';
                }
            });
        }

        console.log('✓ Recovery Phrase page initialized successfully');

    } catch (error) {
        console.error('✗ Error initializing Recovery Phrase page:', error);
        alert('Failed to generate recovery phrase: ' + error.message);
    }
}

/**
 * PAGE 4: CONFIRM RECOVERY PHRASE LOGIC
 */
function initializeConfirmPhrasePage() {
    const wordGrid = document.getElementById('wordGrid');
    if (!wordGrid) return; // Exit if not on confirm-phrase.html

    console.log('Initializing Confirm Phrase Page (Page 4)...');

    const tempPhrase = getTempPhrase();
    if (!tempPhrase) {
        alert('No recovery phrase found in session. Restarting creation process...');
        window.location.href = '../index.html';
        return;
    }

    targetWords = tempPhrase.split(' ');
    selectedWords = [];

    // Shuffle 12 words for pool selection
    wordPool = targetWords.map((word, idx) => ({ id: idx, word })).sort(() => Math.random() - 0.5);

    renderConfirmUI();
}

/**
 * Render Confirm Phrase Challenge UI (Selected slots & Word pool)
 */
function renderConfirmUI() {
    const wordGrid = document.getElementById('wordGrid');
    const selectedWordsDisplay = document.getElementById('selectedWordsDisplay');
    const verifyBtn = document.getElementById('verifyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const progressBar = document.getElementById('progressBar');

    if (!wordGrid || !selectedWordsDisplay) return;

    // Render Selected Words Container
    selectedWordsDisplay.innerHTML = '';
    if (selectedWords.length === 0) {
        selectedWordsDisplay.innerHTML = '<span class="text-muted small">Click words below in the correct order (1 to 12)...</span>';
    } else {
        selectedWords.forEach((item, index) => {
            const badge = document.createElement('button');
            badge.type = 'button';
            badge.className = 'btn btn-warning btn-sm me-1 mb-1 fade-in font-monospace';
            badge.innerHTML = `<strong>#${index + 1}</strong> ${item.word} <i class="bi bi-x ms-1"></i>`;
            badge.addEventListener('click', () => deselectWord(index));
            selectedWordsDisplay.appendChild(badge);
        });
    }

    // Render Shuffled Word Pool Grid
    wordGrid.innerHTML = '';
    wordPool.forEach((item) => {
        const isSelected = selectedWords.some(s => s.id === item.id);

        const col = document.createElement('div');
        col.className = 'col-md-3 col-6';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = isSelected 
            ? 'btn btn-secondary w-100 word-button opacity-50' 
            : 'btn btn-outline-warning w-100 word-button fade-in';
        button.textContent = item.word;
        button.disabled = isSelected;

        if (!isSelected) {
            button.addEventListener('click', () => selectWord(item));
        }

        col.appendChild(button);
        wordGrid.appendChild(col);
    });

    // Update Progress Bar
    if (progressBar) {
        const progress = (selectedWords.length / targetWords.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Enable/Disable Verify Button
    if (verifyBtn) {
        verifyBtn.disabled = selectedWords.length !== targetWords.length;
    }

    // Reset Button Event Listener
    if (resetBtn) {
        resetBtn.onclick = () => {
            selectedWords = [];
            renderConfirmUI();
        };
    }

    // Verify Button Event Listener
    if (verifyBtn) {
        verifyBtn.onclick = handleVerifyConfirmation;
    }
}

/**
 * Handle user clicking a word from the pool
 */
function selectWord(item) {
    if (selectedWords.length < targetWords.length) {
        selectedWords.push(item);
        renderConfirmUI();
    }
}

/**
 * Handle user deselecting a word from the selection area
 */
function deselectWord(index) {
    selectedWords.splice(index, 1);
    renderConfirmUI();
}

/**
 * Handle verification check when all 12 words are selected
 */
async function handleVerifyConfirmation() {
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const verifyBtn = document.getElementById('verifyBtn');

    const userSequence = selectedWords.map(item => item.word).join(' ');
    const targetSequence = targetWords.join(' ');

    if (userSequence === targetSequence) {
        console.log('✓ Recovery phrase sequence verified successfully!');

        if (successAlert) successAlert.style.display = 'block';
        if (errorAlert) errorAlert.style.display = 'none';
        if (verifyBtn) verifyBtn.disabled = true;

        try {
            // Import/Generate finalized wallet data object
            const phrase = getTempPhrase();
            const walletData = await importWallet(phrase);

            // Save to localStorage as JSON
            saveWallet(walletData);

            // Clear temporary session data
            clearTempPhrase();
            clearTempPassword();

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);

        } catch (err) {
            console.error('Error saving verified wallet:', err);
            alert('Failed to save wallet: ' + err.message);
        }

    } else {
        console.log('✗ Verification failed. Sequence incorrect.');
        if (errorAlert) errorAlert.style.display = 'block';

        setTimeout(() => {
            if (errorAlert) errorAlert.style.display = 'none';
            selectedWords = [];
            renderConfirmUI();
        }, 1800);
    }
}

/**
 * Global App Initialization Router
 */
function initApp() {
    initializeRecoveryPhrasePage();
    initializeConfirmPhrasePage();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('%c🚀 EtherVault app.js Module Ready', 'color: #F6851B; font-weight: bold;');
