/**
 * password.js
 * 
 * Handles password creation and strength verification on create-password.html.
 */

// Form Elements
const passwordForm = document.getElementById('passwordForm');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const acknowledgementCheckbox = document.getElementById('acknowledgement');
const nextBtn = document.getElementById('nextBtn');
const strengthBar = document.getElementById('strengthBar');
const passwordMatchMessage = document.getElementById('passwordMatch');

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(input, button) {
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="bi bi-eye-fill"></i>';
    }
}

/**
 * Calculate password strength score (0-3)
 */
function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    return Math.min(strength, 3);
}

/**
 * Update strength indicator bar & label
 */
function updatePasswordStrength() {
    if (!passwordInput || !strengthBar) return;
    const password = passwordInput.value;
    const strength = calculatePasswordStrength(password);
    const percentage = (strength / 3) * 100;
    const strengthLabel = document.getElementById('strengthLabel');
    
    strengthBar.style.width = percentage + '%';
    strengthBar.style.background = '';

    const labels = ['Enter a password...', 'Weak — add numbers & symbols', 'Medium — add uppercase letters', 'Strong password!'];
    const colors = ['var(--text-dim)', 'var(--danger)', 'var(--warning)', 'var(--green)'];
    const barColors = ['', 'var(--danger)', 'var(--warning)', 'var(--green)'];

    if (password.length === 0) {
        strengthBar.style.width = '0%';
        if (strengthLabel) { strengthLabel.textContent = labels[0]; strengthLabel.style.color = colors[0]; }
        return;
    }
    strengthBar.style.background = barColors[strength] || 'var(--primary)';
    if (strengthLabel) { strengthLabel.textContent = labels[strength]; strengthLabel.style.color = colors[strength]; }
}

/**
 * Validate matching passwords
 */
function validatePasswords() {
    if (!passwordInput || !confirmPasswordInput) return false;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const match = password === confirmPassword;
    
    if (!match && confirmPassword.length > 0) {
        if (passwordMatchMessage) passwordMatchMessage.classList.remove('d-none');
        confirmPasswordInput.classList.add('is-invalid');
    } else {
        if (passwordMatchMessage) passwordMatchMessage.classList.add('d-none');
        confirmPasswordInput.classList.remove('is-invalid');
    }
    return match;
}

function validatePasswordLength() {
    return passwordInput && passwordInput.value.length >= 8;
}

function updateNextButtonState() {
    if (!nextBtn || !acknowledgementCheckbox) return;
    const passwordsMatch = validatePasswords();
    const passwordLengthValid = validatePasswordLength();
    const acknowledged = acknowledgementCheckbox.checked;

    nextBtn.disabled = !(passwordsMatch && passwordLengthValid && acknowledged);
}

function proceedToRecoveryPhrase() {
    try {
        const password = passwordInput.value;
        saveTempPassword(password);

        console.log('✓ Password set successfully');

        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show mb-4 fade-in';
        alertDiv.innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            <strong>Password Created!</strong> Generating recovery phrase...
        `;
        
        const cardBody = document.querySelector('.card-body');
        if (cardBody) cardBody.insertBefore(alertDiv, passwordForm);

        setTimeout(() => {
            window.location.href = 'recovery-phrase.html';
        }, 1200);
    } catch (error) {
        console.error('✗ Error saving password:', error);
        alert('Error setting password. Please try again.');
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    if (!validatePasswordLength()) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    if (!validatePasswords()) {
        alert('Passwords do not match.');
        return;
    }

    if (!acknowledgementCheckbox.checked) {
        alert('You must acknowledge the security notice to proceed.');
        return;
    }

    proceedToRecoveryPhrase();
}

function initializePasswordForm() {
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => togglePasswordVisibility(passwordInput, togglePasswordBtn));
    }

    if (toggleConfirmPasswordBtn) {
        toggleConfirmPasswordBtn.addEventListener('click', () => togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordBtn));
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            updatePasswordStrength();
            updateNextButtonState();
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', updateNextButtonState);
    }

    if (acknowledgementCheckbox) {
        acknowledgementCheckbox.addEventListener('change', updateNextButtonState);
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', handleFormSubmit);
    }

    updateNextButtonState();
    console.log('✓ Password form initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePasswordForm);
} else {
    initializePasswordForm();
}

console.log('%c🔒 EtherVault Password Module Loaded', 'color: #F6851B; font-weight: bold; font-size: 14px;');
