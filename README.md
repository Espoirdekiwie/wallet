# ⬡ EtherVault — Web3 Crypto Wallet

**EtherVault** is a modern, non-custodial Web3 Ethereum cryptocurrency wallet built with React, Ethers.js v6, and Framer Motion. It delivers client-side security with an obsidian glassmorphism user interface.

---

## ✨ Key Features

- **🔒 Non-Custodial & Client-Side Encryption**:
  - BIP39 standard 12-word mnemonic phrase generation and restoration.
  - Password-derived Keystore encryption using AES-128-CTR and Scrypt KDF.
  - Zero telemetry — private keys never leave your browser session.

- **📱 Modern Navigation**:
  - Animated collapsible glassmorphic drawer accessible via universal hamburger menu (**☰**).
  - Dismissible via backdrop click, `Escape` key, or route selection.
  - Responsive: Full-width overlay on desktop and 80% screen width on mobile.

- **💎 Dashboard & Portfolio**:
  - Real-time ETH and multi-token balance tracking.
  - 3D interactive holographic wallet card with mouse-tilt physics.
  - Live gas tracker and quick transaction action cards.

- **💸 Send & Receive Assets**:
  - Fast ETH and ERC-20 token transfers with address validation.
  - Dynamic QR code generator adhering to the EIP-681 standard.

- **📜 Activity & Ledger History**:
  - Filterable transaction history (Sent, Received, Swaps).
  - One-click CSV export and transaction hash clipboard utility.

- **⚙️ Settings & Security Controls**:
  - Global **Dark Mode** toggle with persistent local preferences.
  - Secure credential viewer (decrypt and export 12-word seed or private key).
  - Clear Wallet data workflow with confirmation dialog.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Web3 & Cryptography**: Ethers.js v6, BIP39 standard
- **Animations**: Framer Motion
- **UI & Styling**: Vanilla CSS + Bootstrap 5 (Glassmorphism design system)
- **Icons**: React Icons (Feather, Bootstrap, FontAwesome)
- **Deployment**: Vercel ready (`vercel.json` SPA rewrites)

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Espoirdekiwie/wallet.git
cd wallet
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📄 License
MIT License. Free for open-source Web3 development.
