# 🔐 EtherVault - Ethereum Wallet Application

A modern, secure, and user-friendly Ethereum wallet built with vanilla JavaScript, Bootstrap 5, and ethers.js v6. Inspired by MetaMask, EtherVault provides a clean interface for managing Ethereum accounts directly in your browser.

## 📋 Features

✅ **Create Wallet** - Generate a new Ethereum wallet with BIP39 recovery phrase  
✅ **Import Wallet** - Restore existing wallet using 12-word recovery phrase  
✅ **Secure Password Protection** - Password-based encryption for wallet data  
✅ **Recovery Phrase Backup** - Download or copy your recovery phrase securely  
✅ **Recovery Phrase Verification** - Confirm phrase during wallet creation  
✅ **Dashboard** - View wallet address, public key, and details  
✅ **QR Code Generation** - Display QR code for receiving crypto  
✅ **Copy to Clipboard** - Easy address copying functionality  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Dark Theme** - MetaMask-inspired dark UI with orange accents  
✅ **Client-Side Only** - Private keys never leave your device  
✅ **No Database** - All data stored locally in browser storage  

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **npm** (comes with Node.js)

### Installation

1. **Clone or extract the project**
```bash
cd ether-vault
```

2. **Install dependencies**
```bash
npm install
```

This will install:
- `ethers@^6.7.0` - Ethereum library for blockchain interaction
- `express@^4.18.2` - Web server for development

3. **Start the development server**
```bash
npm run dev
# or
npm start
```

4. **Open in browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
ether-vault/
│
├── index.html                          # Welcome/Home page
├── package.json                        # Project dependencies
├── server.js                          # Express development server
│
├── assets/
│   └── logo.png                       # App logo (placeholder)
│
├── css/
│   └── style.css                      # Main stylesheet (Bootstrap 5 + custom)
│
├── js/
│   ├── app.js                         # Main app logic (recovery phrase verification)
│   ├── dashboard.js                   # Dashboard page handler
│   ├── import.js                      # Wallet import functionality
│   ├── password.js                    # Password validation
│   ├── recovery-phrase-handler.js     # Recovery phrase generation & display
│   ├── storage.js                     # localStorage management
│   └── wallet.js                      # Wallet creation & management (ethers.js)
│
└── pages/
    ├── create-password.html           # Step 1: Create password
    ├── recovery-phrase.html           # Step 2: Display recovery phrase
    ├── confirm-phrase.html            # Step 3: Verify recovery phrase
    ├── import-wallet.html             # Import existing wallet
    └── dashboard.html                 # Main wallet dashboard
```

## 📖 User Flow

### Creating a New Wallet

1. **Welcome Page** (`index.html`)
   - Click "Create New Wallet" button
   
2. **Create Password** (`pages/create-password.html`)
   - Enter and confirm password (min 8 characters)
   - Accept security acknowledgement
   - Proceeds to recovery phrase generation

3. **Recovery Phrase** (`pages/recovery-phrase.html`)
   - Displays 12-word BIP39 recovery phrase
   - Options to copy or download phrase
   - Must acknowledge phrase is saved

4. **Confirm Phrase** (`pages/confirm-phrase.html`)
   - Randomly select 4 words from the phrase in correct order
   - Verifies user has properly saved the phrase
   
5. **Dashboard** (`pages/dashboard.html`)
   - View wallet address, public key
   - Generate QR code for receiving ETH
   - Logout and clear wallet data

### Importing Existing Wallet

1. **Welcome Page** (`index.html`)
   - Click "Import Existing Wallet" button

2. **Import Wallet** (`pages/import-wallet.html`)
   - Enter 12-word recovery phrase
   - Set a new password
   - Wallet is imported and loaded

3. **Dashboard** (`pages/dashboard.html`)
   - Same as new wallet workflow

## 🔐 Security Features

### Client-Side Only
- All wallet generation and signing happens in the browser
- Private keys **never** sent to any server
- No backend database required

### Local Storage
- Wallet data stored in browser's `localStorage`
- Recovery phrases temporarily stored in `sessionStorage` during creation
- Data persists until user logs out or clears browser storage

### Password Protection
- Passwords validated for minimum 8 characters
- Real-time password strength indicator
- Confirmation required for password entry

### Recovery Phrase
- 12-word BIP39 standard mnemonic
- Downloadable as text file
- Copyable to clipboard
- Requires verification during creation

### Best Practices
- Never display private key on UI
- Recovery phrase shown only once
- Logout clears all session data
- Security warnings throughout application

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Framework**: Bootstrap 5 (CDN)
- **Web3**: ethers.js v6
- **Icons**: Bootstrap Icons
- **QR Codes**: QRCode.js
- **Server**: Express.js (for development)
- **Storage**: localStorage & sessionStorage

## 📦 Core Modules

### `storage.js`
Handles all localStorage operations:
- `saveWallet(walletData, password)` - Save wallet to storage
- `loadWallet(password)` - Retrieve wallet from storage
- `clearWallet()` - Delete wallet data
- `hasWallet()` - Check if wallet exists
- `saveTempPassword()` / `getTempPassword()` - Session password
- `saveTempPhrase()` / `getTempPhrase()` - Session recovery phrase

### `wallet.js`
Wallet management using ethers.js:
- `createWallet()` - Generate new random wallet
- `importWallet(mnemonicPhrase)` - Import from recovery phrase
- `getAddress(walletData)` - Get wallet address
- `getMnemonic(walletData)` - Get recovery phrase
- `getPrivateKey(walletData)` - Get private key
- `getPublicKey(walletData)` - Get public key
- `shortenAddress(address)` - Format address for display
- `isValidAddress(address)` - Validate Ethereum address
- `isValidMnemonic(phrase)` - Validate recovery phrase

### `password.js`
Password handling and validation:
- Toggle password visibility
- Calculate password strength (0-3 scale)
- Validate matching passwords
- Update strength indicator
- Real-time form validation

### `dashboard.js`
Dashboard functionality:
- Display wallet information
- Generate QR code (QRCode.js library)
- Copy to clipboard functionality
- Logout and session clearing
- Display creation date and metadata

### `app.js`
Recovery phrase verification:
- Generate random verification challenge
- Handle word selection
- Verify correct order
- Navigate to dashboard on success

### `import.js`
Wallet import functionality:
- Validate recovery phrase format
- Import wallet using ethers.js
- Save to localStorage
- Navigate to dashboard

### `recovery-phrase-handler.js`
Recovery phrase display:
- Generate new wallet
- Display 12-word phrase in grid
- Copy to clipboard
- Download as file
- Verify user acknowledgement

## 🎨 Design System

### Color Palette
- **Primary Orange**: `#F6851B` (MetaMask brand color)
- **Dark Background**: `#1a1a1a`
- **Card Background**: `#2d2d2d`
- **Text**: `#ffffff`
- **Muted Text**: `#999999`
- **Success**: `#10b981`
- **Danger**: `#ef4444`
- **Warning**: `#f59e0b`
- **Info**: `#3b82f6`

### UI Components
- **Cards**: Rounded corners, soft shadows, hover effects
- **Buttons**: Orange primary, outline variants, disabled states
- **Forms**: Dark inputs with orange focus state
- **Alerts**: Color-coded with icons
- **Progress**: Orange filled bar with smooth animation
- **Badges**: Used for step indicators and status

### Responsive Breakpoints
- **Desktop**: Full layout (>768px)
- **Tablet**: Adjusted padding (768px - 576px)
- **Mobile**: Optimized grid layout (<576px)

## 🔌 Future Enhancements

The architecture supports future features:

- ✅ **Send Transactions** - Transfer ETH to other addresses
- ✅ **Receive Transactions** - Display full QR code flow
- ✅ **Transaction History** - View past transactions
- ✅ **Balance Display** - Show ETH balance from blockchain
- ✅ **Network Switching** - Support Ethereum Mainnet, Sepolia Testnet
- ✅ **Smart Contracts** - Interact with contracts
- ✅ **MetaMask Integration** - Connect to MetaMask
- ✅ **Hardware Wallet Support** - Ledger, Trezor integration
- ✅ **Multi-Signature Wallets** - Shared ownership
- ✅ **ENS Domain Support** - .eth addresses
- ✅ **Token Swaps** - DEX integration
- ✅ **NFT Management** - View and transfer NFTs
- ✅ **Browser Extension** - Package as Chrome/Firefox extension

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create new wallet with 12-word phrase
- [ ] Verify password validation (min 8 chars)
- [ ] Verify recovery phrase confirmation
- [ ] Copy recovery phrase to clipboard
- [ ] Download recovery phrase file
- [ ] View wallet address and public key
- [ ] Generate QR code
- [ ] Copy address to clipboard
- [ ] Logout and verify data cleared
- [ ] Import wallet with existing phrase
- [ ] Test responsive design on mobile
- [ ] Test keyboard navigation
- [ ] Verify all alerts display correctly

### Browser Compatibility
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚨 Security Warnings

### DO NOT
- ❌ Share your recovery phrase with anyone
- ❌ Store recovery phrase online or in cloud
- ❌ Take screenshots of your recovery phrase
- ❌ Use the same password as other accounts
- ❌ Store private key in files or screenshots
- ❌ Connect to public WiFi while creating wallet
- ❌ Leave wallet logged in on shared computers

### DO
- ✅ Write down recovery phrase and store securely
- ✅ Use strong, unique passwords
- ✅ Keep browser and system updated
- ✅ Use HTTPS when accessing wallet
- ✅ Clear browser history after logout
- ✅ Verify addresses before sending
- ✅ Test with small amounts first

## 📝 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

EtherVault Development Team

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review code comments for implementation details

## 🔗 Resources

- [ethers.js Documentation](https://docs.ethers.org/)
- [Ethereum Documentation](https://ethereum.org/developers)
- [BIP39 Specification](https://github.com/trezor/python-mnemonic)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.3/)
- [MetaMask Documentation](https://docs.metamask.io/)

## ⚠️ Disclaimer

This is an educational project for learning blockchain development. Always:
- Test thoroughly before production use
- Never use with real funds until fully audited
- Understand smart contract risks
- Verify code from reputable sources
- Keep private keys secure at all times

---

**Built with ❤️ for the Ethereum community**

**Version**: 1.0.0  
**Last Updated**: 2024
