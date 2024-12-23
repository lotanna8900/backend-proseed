import React from 'react';
import './NavigationBar.css';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaHandshake, FaTasks, FaTrophy, FaWallet } from 'react-icons/fa';

const NavigationBar = () => {
  const navigate = useNavigate();

  // Handle navigation between pages
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="navigation-bar">
      <div className="nav-item" onClick={() => handleNavigation('/home')}>
        <FaHome className="nav-icon" />
        <p>Home</p>
      </div>
      <div className="nav-item" onClick={() => handleNavigation('/opportunity')}>
        <FaHandshake className="nav-icon" />
        <p>Opportunity</p>
      </div>
      <div className="nav-item" onClick={() => handleNavigation('/earn')}>
        <FaTasks className="nav-icon" />
        <p>Earn</p>
      </div>
      <div className="nav-item" onClick={() => handleNavigation('/leaderboard')}>
        <FaTrophy className="nav-icon" />
        <p>Leaderboard</p>
      </div>
      <div className="nav-item" onClick={() => handleNavigation('/wallet')}>
        <FaWallet className="nav-icon" />
        <p>Wallet</p>
      </div>
    </div>
  );
};

export default NavigationBar;
