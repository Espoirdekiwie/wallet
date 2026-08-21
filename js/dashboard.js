/**
 * dashboard.js
 * 
 * Handles interactive wallet dashboard features:
 * - Live ETH/USD balance calculation & toggle
 * - Interactive Send ETH modal with live gas fee calculation & balance updates
 * - Receive ETH modal with dynamic custom amount QR code generator
 * - Network Switcher (Mainnet, Sepolia, Polygon, Arbitrum)
 * - Dynamic Transaction History rendering with filters
 * - Export Private Key & Backup recovery phrase modal
 * - Privacy eye-toggle for sensitive data
 */

// Global State
let currentWalletData = null;
let ethPriceUsd = 3250.45;
let isUsdDisplay = false;
let isPrivacyHidden = false;

/**
 * Networks Configuration
 */
const NETWORKS = {
    'mainnet': { name: 'Ethereum Mainnet', symbol: 'ETH', chainId: 1, color: '#F6851B', icon: 'bi-ethereum' },
    'sepolia': { name: 'Sepolia Testnet', symbol: 'SepoliaETH', chainId: 11155111, color: '#F59E0B', icon: 'bi-vial' },
    'polygon': { name: 'Polygon Mainnet', symbol: 'MATIC', chainId: 137, color: '#8B5CF6', icon: 'bi-hexagon' },
    'arbitrum': { name: 'Arbitrum One', symbol: 'ETH', chainId: 42161, color: '#3B82F6', icon: 'bi-layers' }
};

/**
 * Initialize Dashboard on Page Load
 */
async function initializeDashboard() {
    try {
        console.log('Initializing EtherVault Dashboard...');

        const walletData = loadWallet();
        if (!walletData) {
            console.warn('⚠️ No active wallet session found. Redirecting...');
            window.location.href = '../index.html';
            return;
        }

        currentWalletData = walletData;

        // Render wallet details
        renderBalanceDisplay();
        renderWalletAddress();
        renderWalletMetadata();
        renderNetworkBadge();
        renderTransactionHistory();

        // Setup event handlers
        setupDashboardEventListeners();
        setupSendModalListeners();
        setupReceiveModalListeners();
        setupNetworkModalListeners();
        setupExportModalListeners();

        console.log('✓ Dashboard initialized successfully');

    } catch (error) {
        console.error('✗ Error initializing dashboard:', error.message);
    }
}

/**
 * Render Balance Display with ETH <-> USD toggle
 */
function renderBalanceDisplay() {
    const balanceDisplay = document.getElementById('balanceDisplay');
    const usdValueDisplay = document.getElementById('usdValueDisplay');
    const ethPriceDisplay = document.getElementById('ethPriceDisplay');

    if (!currentWalletData) return;

    const ethBalance = parseFloat(currentWalletData.balance || '2.45');
    const usdBalance = (ethBalance * ethPriceUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (ethPriceDisplay) {
        ethPriceDisplay.textContent = `$${ethPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    if (isPrivacyHidden) {
        if (balanceDisplay) balanceDisplay.textContent = '••••••••';
        if (usdValueDisplay) usdValueDisplay.textContent = '≈ $••••';
        return;
    }

    if (isUsdDisplay) {
        if (balanceDisplay) balanceDisplay.textContent = `$${usdBalance}`;
        if (usdValueDisplay) usdValueDisplay.textContent = `≈ ${ethBalance.toFixed(4)} ETH`;
    } else {
        if (balanceDisplay) balanceDisplay.textContent = `${ethBalance.toFixed(4)} ETH`;
        if (usdValueDisplay) usdValueDisplay.textContent = `≈ $${usdBalance} USD`;
    }
}

/**
 * Render Wallet Address & Public Key
 */
function renderWalletAddress() {
    if (!currentWalletData) return;

    const fullAddressInput = document.getElementById('fullAddress');
    const shortAddressElement = document.getElementById('shortAddress');
    const publicKeyInput = document.getElementById('publicKey');

    const address = currentWalletData.address;

    if (isPrivacyHidden) {
        if (fullAddressInput) fullAddressInput.value = '0x••••••••••••••••••••••••••••••••••••••••';
        if (shortAddressElement) shortAddressElement.textContent = '0x••••...••••';
        if (publicKeyInput) publicKeyInput.value = '0x••••••••••••••••••••••••••••••••••••••••';
        return;
    }

    if (fullAddressInput) fullAddressInput.value = address;
    if (shortAddressElement) shortAddressElement.textContent = shortenAddress(address, 6);
    if (publicKeyInput) publicKeyInput.value = currentWalletData.publicKey || address;
}

/**
 * Render Metadata & Creation Details
 */
function renderWalletMetadata() {
    if (!currentWalletData) return;

    const createdDateElement = document.getElementById('createdDate');
    const walletTypeBadge = document.getElementById('walletTypeBadge');

    if (createdDateElement && currentWalletData.createdAt) {
        const date = new Date(currentWalletData.createdAt);
        createdDateElement.textContent = date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    if (walletTypeBadge) {
        walletTypeBadge.textContent = currentWalletData.imported ? 'Imported Wallet' : 'Created Wallet';
    }
}

/**
 * Render Active Network Badge
 */
function renderNetworkBadge() {
    const activeNetworkId = getSelectedNetwork();
    const networkInfo = NETWORKS[activeNetworkId] || NETWORKS['mainnet'];

    const networkNameDisplays = document.querySelectorAll('.network-name-display');
    const networkBadge = document.getElementById('currentNetworkBadge');

    networkNameDisplays.forEach(el => el.textContent = networkInfo.name);

    if (networkBadge) {
        networkBadge.innerHTML = `
            <span class="pulse-dot"></span>
            <i class="bi ${networkInfo.icon} me-1" style="color:${networkInfo.color}"></i>
            ${networkInfo.name}
        `;
    }
}

/**
 * Render Transaction History with Filter
 */
function renderTransactionHistory(filter = 'all') {
    const txContainer = document.getElementById('txHistoryList');
    if (!txContainer) return;

    const transactions = getTransactions();

    let filtered = transactions;
    if (filter === 'sent') filtered = transactions.filter(t => t.type === 'Send');
    if (filter === 'received') filtered = transactions.filter(t => t.type === 'Receive');

    if (filtered.length === 0) {
        txContainer.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                <p class="mb-0">No transactions recorded yet.</p>
            </div>
        `;
        return;
    }

    txContainer.innerHTML = filtered.map(tx => {
        const isSend = tx.type === 'Send';
        const iconClass = isSend ? 'bi-arrow-up-right-circle-fill text-danger' : 'bi-arrow-down-left-circle-fill text-success';
        const amountSign = isSend ? '-' : '+';
        const amountColor = isSend ? 'text-white' : 'text-success';

        const dateStr = new Date(tx.timestamp).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return `
            <div class="glass-panel mb-3 p-3 fade-in d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-3">
                    <i class="bi ${iconClass} fs-3"></i>
                    <div>
                        <div class="fw-bold text-white mb-1 d-flex align-items-center gap-2">
                            ${tx.type} ETH
                            <span class="badge bg-success small">${tx.status || 'Confirmed'}</span>
                        </div>
                        <small class="text-muted">
                            ${isSend ? `To: ${shortenAddress(tx.to, 4)}` : `From: ${shortenAddress(tx.from, 4)}`} • ${dateStr}
                        </small>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold ${amountColor} fs-5">${amountSign}${tx.amount} ETH</div>
                    <small class="text-muted">≈ $${(parseFloat(tx.amount) * ethPriceUsd).toFixed(2)} USD</small>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Setup General Dashboard Event Listeners
 */
function setupDashboardEventListeners() {
    // Balance Currency Toggle
    const balanceCard = document.getElementById('balanceCard');
    if (balanceCard) {
        balanceCard.addEventListener('click', () => {
            isUsdDisplay = !isUsdDisplay;
            renderBalanceDisplay();
            showToastNotification(isUsdDisplay ? 'Displaying balance in USD' : 'Displaying balance in ETH');
        });
    }

    // Privacy Eye Toggle
    const togglePrivacyBtn = document.getElementById('togglePrivacyBtn');
    if (togglePrivacyBtn) {
        togglePrivacyBtn.addEventListener('click', () => {
            isPrivacyHidden = !isPrivacyHidden;
            togglePrivacyBtn.innerHTML = isPrivacyHidden 
                ? '<i class="bi bi-eye-fill me-1"></i>Show Details'
                : '<i class="bi bi-eye-slash-fill me-1"></i>Hide Details';
            
            renderBalanceDisplay();
            renderWalletAddress();
        });
    }

    // Copy Address Button
    const copyFullBtn = document.getElementById('copyFullBtn');
    if (copyFullBtn) {
        copyFullBtn.addEventListener('click', () => {
            if (currentWalletData) {
                copyToClipboard(currentWalletData.address, 'Wallet Address copied!');
            }
        });
    }

    // Copy Public Key Button
    const copyPublicBtn = document.getElementById('copyPublicBtn');
    if (copyPublicBtn) {
        copyPublicBtn.addEventListener('click', () => {
            if (currentWalletData) {
                copyToClipboard(currentWalletData.publicKey || currentWalletData.address, 'Public key copied!');
            }
        });
    }

    // Logout Modal Confirm Button
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            console.log('Logging out user...');
            clearWallet();

            // Hide modal
            const logoutModalEl = document.getElementById('logoutModal');
            if (logoutModalEl) {
                const modalInst = bootstrap.Modal.getInstance(logoutModalEl);
                if (modalInst) modalInst.hide();
            }

            showToastNotification('Logged out successfully!');

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 500);
        });
    }

    // Filter transaction buttons
    document.querySelectorAll('[data-tx-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('[data-tx-filter]').forEach(b => b.classList.remove('active', 'btn-warning'));
            document.querySelectorAll('[data-tx-filter]').forEach(b => b.classList.add('btn-outline-secondary'));
            
            e.currentTarget.classList.remove('btn-outline-secondary');
            e.currentTarget.classList.add('active', 'btn-warning');
            
            renderTransactionHistory(e.currentTarget.dataset.txFilter);
        });
    });
}

/**
 * Setup Send ETH Modal Listeners & Flow
 */
function setupSendModalListeners() {
    const sendForm = document.getElementById('sendEthForm');
    const recipientInput = document.getElementById('sendRecipient');
    const amountInput = document.getElementById('sendAmount');
    const usdEquivalent = document.getElementById('sendUsdEquivalent');
    const maxAmountBtn = document.getElementById('maxAmountBtn');
    const gasFeeSelect = document.getElementById('gasFeeSelect');

    if (!sendForm) return;

    // Amount change listener
    amountInput.addEventListener('input', () => {
        const val = parseFloat(amountInput.value) || 0;
        if (usdEquivalent) {
            usdEquivalent.textContent = `≈ $${(val * ethPriceUsd).toFixed(2)} USD`;
        }
    });

    // Max Amount Button
    if (maxAmountBtn) {
        maxAmountBtn.addEventListener('click', () => {
            const currentBal = parseFloat(currentWalletData.balance || '2.45');
            const maxVal = Math.max(0, currentBal - 0.0005).toFixed(4);
            amountInput.value = maxVal;
            if (usdEquivalent) {
                usdEquivalent.textContent = `≈ $${(maxVal * ethPriceUsd).toFixed(2)} USD`;
            }
        });
    }

    // Form submission
    sendForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const recipient = recipientInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const currentBal = parseFloat(currentWalletData.balance || '2.45');
        const fee = parseFloat(gasFeeSelect ? gasFeeSelect.value : '0.0004');

        if (!isValidAddress(recipient)) {
            alert('Invalid Ethereum recipient address');
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid ETH amount');
            return;
        }

        if (amount + fee > currentBal) {
            alert('Insufficient balance including estimated gas fees');
            return;
        }

        // Show sending status on submit button
        const submitBtn = document.getElementById('confirmSendBtn');
        const origText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="spinner-border spinner-border-sm me-2"></div>Broadcasting Transaction...`;

        // Simulate network processing delay
        await new Promise(r => setTimeout(r, 1800));

        // Deduct balance
        const newBal = (currentBal - (amount + fee)).toFixed(4);
        currentWalletData.balance = newBal;
        updateWalletBalance(newBal);

        // Record transaction
        const randomTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        addTransaction({
            hash: shortenAddress(randomTxHash, 4),
            fullHash: randomTxHash,
            type: 'Send',
            from: 'Self',
            to: recipient,
            amount: amount.toFixed(4),
            symbol: 'ETH',
            timestamp: Date.now(),
            status: 'Confirmed',
            fee: fee.toString()
        });

        // Update UI
        renderBalanceDisplay();
        renderTransactionHistory();
        showToastNotification(`Successfully sent ${amount} ETH!`);

        // Close modal & reset
        const sendModalEl = document.getElementById('sendModal');
        const modalInstance = bootstrap.Modal.getInstance(sendModalEl);
        if (modalInstance) modalInstance.hide();

        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
        sendForm.reset();
        if (usdEquivalent) usdEquivalent.textContent = '≈ $0.00 USD';
    });
}

/**
 * Setup Receive Modal & Dynamic QR Code
 */
function setupReceiveModalListeners() {
    const qrContainer = document.getElementById('receiveQrCode');
    const requestAmountInput = document.getElementById('requestAmountInput');

    const qrModal = document.getElementById('receiveModal');
    if (!qrModal) return;

    function updateQr() {
        if (!currentWalletData || !qrContainer) return;
        qrContainer.innerHTML = '';
        
        const reqVal = requestAmountInput ? requestAmountInput.value.trim() : '';
        let uri = `ethereum:${currentWalletData.address}`;
        if (reqVal && !isNaN(reqVal) && parseFloat(reqVal) > 0) {
            uri += `?value=${reqVal}`;
        }

        try {
            new QRCode(qrContainer, {
                text: uri,
                width: 210,
                height: 210,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (err) {
            console.error('QR code generation error:', err);
        }
    }

    qrModal.addEventListener('show.bs.modal', updateQr);
    if (requestAmountInput) {
        requestAmountInput.addEventListener('input', updateQr);
    }

    const copyReceiveAddressBtn = document.getElementById('copyReceiveAddressBtn');
    if (copyReceiveAddressBtn) {
        copyReceiveAddressBtn.addEventListener('click', () => {
            if (currentWalletData) {
                copyToClipboard(currentWalletData.address, 'Address copied to clipboard!');
            }
        });
    }
}

/**
 * Setup Network Switcher Modal
 */
function setupNetworkModalListeners() {
    document.querySelectorAll('[data-network-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const netId = e.currentTarget.dataset.networkId;
            setSelectedNetwork(netId);
            renderNetworkBadge();

            document.querySelectorAll('[data-network-id]').forEach(b => b.classList.remove('border-warning', 'bg-warning-subtle'));
            e.currentTarget.classList.add('border-warning');

            const netModal = document.getElementById('networkModal');
            const modalInst = bootstrap.Modal.getInstance(netModal);
            if (modalInst) modalInst.hide();

            showToastNotification(`Switched network to ${NETWORKS[netId].name}`);
        });
    });
}

/**
 * Setup Export Private Key Modal with Password Check
 */
function setupExportModalListeners() {
    const exportForm = document.getElementById('exportAuthForm');
    const authPasswordInput = document.getElementById('authPasswordInput');
    const exportDetailsBox = document.getElementById('exportDetailsBox');
    const exportPrivateKeyDisplay = document.getElementById('exportPrivateKeyDisplay');
    const exportMnemonicDisplay = document.getElementById('exportMnemonicDisplay');

    if (!exportForm) return;

    exportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = authPasswordInput.value;
        const tempPwd = getTempPassword();

        if (tempPwd && pwd !== tempPwd) {
            alert('Incorrect wallet password.');
            return;
        }

        if (exportDetailsBox && currentWalletData) {
            exportPrivateKeyDisplay.textContent = currentWalletData.privateKey;
            exportMnemonicDisplay.textContent = currentWalletData.mnemonic || 'Imported via Private Key';
            exportDetailsBox.classList.remove('d-none');
            exportForm.classList.add('d-none');
        }
    });

    const exportModal = document.getElementById('exportModal');
    if (exportModal) {
        exportModal.addEventListener('hidden.bs.modal', () => {
            if (exportForm) exportForm.reset(), exportForm.classList.remove('d-none');
            if (exportDetailsBox) exportDetailsBox.classList.add('d-none');
        });
    }
}

/**
 * Copy to Clipboard Helper with Toast
 */
async function copyToClipboard(text, toastMsg = 'Copied to clipboard!') {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        showToastNotification(toastMsg);
    } catch (err) {
        console.error('Clipboard error:', err);
    }
}

/**
 * Show Toast Notification
 */
function showToastNotification(msg) {
    const toastEl = document.getElementById('copyToast');
    const toastMsgEl = document.getElementById('toastMessage');

    if (toastEl && toastMsgEl) {
        toastMsgEl.textContent = msg;
        const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
        toast.show();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

console.log('%c📊 EtherVault Dynamic Dashboard Loaded', 'color: #F6851B; font-weight: bold; font-size: 14px;');
