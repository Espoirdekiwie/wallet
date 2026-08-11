const { ethers } = require("ethers");

const wallet = ethers.Wallet.createRandom();

console.log("Wallet Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Recovery Phrase:", wallet.mnemonic.phrase);