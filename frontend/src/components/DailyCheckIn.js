import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../Context/AppContext';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import './DailyCheckIn.css';

const DailyCheckIn = () => {
  const { user } = useTelegramWebApp();
  const { setPsdtBalance } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  const getMidnight = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const checkStatus = useCallback(async () => {
    if (!user?.id) return;

    const lastCheckIn = localStorage.getItem('lastCheckIn');
    const now = new Date();
    const midnight = getMidnight();

    if (lastCheckIn) {
      const lastCheckInDate = new Date(lastCheckIn);
      setIsCheckedIn(lastCheckInDate.getDate() === now.getDate());
    }

    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setTimeUntilReset(`${hours}h ${minutes}m`);
  }, [user?.id]);

  useEffect(() => {
    checkStatus();
    const timer = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [checkStatus]);

  const handleCheckIn = async () => {
    if (!user?.id || isLoading || isCheckedIn) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/users/dailyCheckIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.id })
      });

      const data = await response.json();
      
      if (response.ok) {
        setPsdtBalance(prev => prev + 100);
        setIsCheckedIn(true);
        localStorage.setItem('lastCheckIn', new Date().toISOString());
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <button 
      className={`checkin-button ${isCheckedIn ? 'claimed' : ''}`}
      onClick={handleCheckIn}
      disabled={isLoading || isCheckedIn}
    >
      {isLoading ? 'Processing...' : 
       isCheckedIn ? `Claimed Today! (Reset in ${timeUntilReset})` : 
       'Claim Daily +100 PSDT'}
    </button>
  );
};

export default DailyCheckIn;
