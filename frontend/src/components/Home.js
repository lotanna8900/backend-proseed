import React, { useEffect } from 'react';
import { useAppContext } from '../Context/AppContext.js'; // Add .js extension
import NavigationBar from './NavigationBar.js'; // Add .js extension
import DailyCheckIn from './DailyCheckIn.js'; // Import the DailyCheckIn component
import './Home.css'; // CSS for styling the Home segment
import { FaTelegram, FaTwitter } from 'react-icons/fa'; // Icons for community links

const Home = () => {
  const {
    psdtBalance,
    setPsdtBalance,
    checkInStatus,
    setCheckInStatus, // Ensure this is included
    telegramId, // Assume this is coming from your context or retrieved from storage
    user, // Add user from context
  } = useAppContext(); // Use the custom hook to access context

  useEffect(() => {
    const fetchUserData = async (id) => {
      try {
        const response = await fetch(`https://backend-proseed.vercel.app/api/users/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPsdtBalance(data.psdtBalance || 1000); // Ensure initial balance is 1000
        setCheckInStatus(data.lastCheckIn && new Date(data.lastCheckIn).toDateString() === new Date().toDateString());
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Fetch user data from server if telegramId is available
    if (telegramId) {
      fetchUserData(telegramId);
    }
  }, [telegramId, setPsdtBalance, setCheckInStatus]);

  return (
    <div className="home-container">
      <h1>Welcome to Proseed</h1>
      {user ? (
        <div>
          <p>Telegram ID: {telegramId || 'Not linked yet'}</p>
          {/* Add more user information here */}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      {/* Display User's Telegram ID */}
      <div className="user-id">
        <span>Telegram ID: {telegramId}</span> {/* Display Telegram ID */}
      </div>

      {/* Daily Check-in Button */}
      <DailyCheckIn /> {/* Use the DailyCheckIn component */}

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