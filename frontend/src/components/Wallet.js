import React, { useState, } from 'react';
import './Wallet.css';

const Wallet = ({ psdtBalance, updateWalletAddress }) => {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletType, setWalletType] = useState('');

  // Simulate wallet connection
  const connectWallet = (type) => {
    let walletAddress = '';
    switch (type) {
      case 'TON Keeper':
        walletAddress = 'ton-keeper-wallet-address'; // Replace with integration logic
        break;
      case 'Telegram Wallet':
        walletAddress = 'telegram-wallet-address'; // Replace with integration logic
        break;
      default:
        return;
    }
    setConnectedWallet(walletAddress);
    setWalletType(type);
    updateWalletAddress(walletAddress); // Update wallet in database
  };

  return (
    <div className="wallet-container">
      {/* Total PSDT Card */}
      <div className="psdt-balance-card">
        <h3>Total $PSDT Earned</h3>
        <p>{psdtBalance} PSDT</p>
      </div>

      {/* Wallet Connect Options */}
      <div className="wallet-connect-section">
        <h2>Connect Wallet</h2>
        {connectedWallet ? (
          <div className="connected-wallet">
            <p>Connected Wallet: {walletType}</p>
            <p>Address: {connectedWallet}</p>
          </div>
        ) : (
          <div className="connect-buttons">
            <button onClick={() => connectWallet('TON Keeper')}>
              Connect TON Keeper
            </button>
            <button onClick={() => connectWallet('Telegram Wallet')}>
              Connect Telegram Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;

