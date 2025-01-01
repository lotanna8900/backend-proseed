import React, { useEffect } from 'react';
import { useAppContext } from '../Context/AppContext.js';
import DailyCheckIn from './DailyCheckIn.js';
import NavigationBar from './NavigationBar.js';
import { FaTelegram, FaTwitter } from 'react-icons/fa';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp.js';
import './Home.css';

const Home = () => {
  const { psdtBalance, setPsdtBalance } = useAppContext();
  const { user } = useTelegramWebApp();

  useEffect(() => {
    if (!user?.id) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/telegram/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setPsdtBalance(data.psdtBalance || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, setPsdtBalance]);

  return (
    <div className="home-container">
      <h1>Welcome to Proseed</h1>
      {user ? (
        <div>
          <p>Telegram ID: {user?.id || 'Not linked yet'}</p>
          {/* Add more user information here */}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      {/* Display User's Telegram ID */}
      <div className="user-id">
        <span>Telegram ID: {user?.id || 'Not linked yet'}</span> {/* Display Telegram ID */}
      </div>

      {/* Daily Check-in Button */}
      <div className="check-in">
        <DailyCheckIn />
      </div>

      {/* proSEED Logo */}
      <div className="logo">
        <img
          src="https://raw.githubusercontent.com/AltaafML/website/main/git_proSEED_256.png"
          alt="proSEED Logo"
          className="circular-image blended-background"
        />
      </div>

      {/* $PSDT Balance Display */}
      <div className="psdt-balance">
        <h2>$PSDT Balance</h2>
        <div className="balance-amount">
          <span>{psdtBalance} PSDT</span> {/* Reflects opening balance and updates */}
        </div>
      </div>

      {/* Community Links */}
      <div className="community-links">
        <a href="https://t.me/+oT_BLMaqF705YzJk" target="_blank" rel="noopener noreferrer" className="join-link">
          <FaTelegram className="community-icon" /> Join Telegram Community
        </a>
        <a href="https://x.com/proSEED_Eng" target="_blank" rel="noopener noreferrer" className="join-link">
          <FaTwitter className="community-icon" /> Join X Community
        </a>
      </div>

      {/* Navigation Bar */}
      <NavigationBar />
    </div>
  );
};

export default Home;