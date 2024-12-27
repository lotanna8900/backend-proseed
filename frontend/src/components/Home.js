import React, { useEffect, useState } from 'react';
import { useAppContext } from '../Context/AppContext.js'; // Add .js extension
import NavigationBar from './NavigationBar.js'; // Add .js extension
import './Home.css'; // CSS for styling the Home segment
import { FaTelegram, FaTwitter } from 'react-icons/fa'; // Icons for community links

const Home = () => {
  const {
    psdtBalance,
    setPsdtBalance,
    checkInStatus,
    setCheckInStatus, // Ensure this is included
    telegramId, // Assume this is coming from your context or retrieved from storage
  } = useAppContext(); // Use the custom hook to access context

  const [telegramID, setTelegramID] = useState('');

  useEffect(() => {
    const fetchUserData = async (id) => {
      try {
        const response = await fetch(`https://backend-proseed.vercel.app/api/users/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPsdtBalance(data.psdtBalance || 1000); // Ensure initial balance is 1000
        setTelegramID(data.telegramId || 'Loading...');
        // Store Telegram ID in local storage
        localStorage.setItem('telegramId', data.telegramId || 'Error loading ID');
      } catch (error) {
        console.error('Error fetching user data:', error);
        setTelegramID('Error loading ID');
      }
    };

    // Fetch user data from server if telegramId is available
    if (telegramId) {
      fetchUserData(telegramId);
    }
  }, [telegramId, setPsdtBalance]);

  const handleCheckIn = async () => {
    if (!checkInStatus) {
      try {
        const response = await fetch('https://backend-proseed.vercel.app/api/users/dailyCheckIn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ telegramId }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setPsdtBalance(data.psdtBalance); // Update balance from server response
        setCheckInStatus(true); // Update check-in status
        alert('Successfully checked in! +100 PSDT added to your balance.');
      } catch (error) {
        console.error('Error during check-in:', error);
        alert('Error during check-in. Please try again later.');
      }
    }
  };

  return (
    <div className="home-container">
      {/* Display User's Telegram ID */}
      <div className="user-id">
        <span>Telegram ID: {telegramID}</span> {/* Display Telegram ID */}
      </div>

      {/* Daily Check-in Button */}
      <div className="check-in">
        <button onClick={handleCheckIn} disabled={checkInStatus}>
          {checkInStatus ? 'Checked In' : 'Daily Check-in (+100 PSDT)'}
        </button>
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
















