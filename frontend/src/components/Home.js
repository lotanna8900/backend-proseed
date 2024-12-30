import React, { useEffect } from 'react';
import { useAppContext } from '../Context/AppContext.js';
import DailyCheckIn from './DailyCheckIn.js';
import './Home.css';
import { FaTelegram, FaTwitter } from 'react-icons/fa';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp.js';

const Home = () => {
  const { psdtBalance, setPsdtBalance, checkInStatus, setCheckInStatus } = useAppContext();
  const { webApp, user } = useTelegramWebApp();

  useEffect(() => {
    if (webApp) {
      webApp.ready();
    }
  }, [webApp]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.id) return;
        const response = await fetch(`/api/users/telegram/${user.id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setPsdtBalance(data.psdtBalance || 1000);
        setCheckInStatus(data.lastCheckIn && 
          new Date(data.lastCheckIn).toDateString() === new Date().toDateString());
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchUserData();
  }, [user, setPsdtBalance, setCheckInStatus]);

  return (
    <div className="home-container">
      <header className="welcome-section">
        <h1>Welcome to Proseed</h1>
      </header>

      <section className="user-info-section">
        <div className="user-detail">
          <h3>Telegram ID</h3>
          <p>{user?.id || 'Not linked yet'}</p>
        </div>
        
        <div className="balance-detail">
          <h3>PSDT Balance</h3>
          <p>{psdtBalance}</p>
        </div>
      </section>

      <section className="daily-checkin-section">
        <DailyCheckIn />
      </section>
    </div>
  );
};

export default Home;