import React, { useState } from 'react';
import { useAppContext } from '../Context/AppContext.js';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp.js';

const DailyCheckIn = () => {
  const { handleDailyCheckIn, checkInStatus } = useAppContext();
  const { user } = useTelegramWebApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckIn = async () => {
    if (!user?.id) {
      setError('Please open in Telegram');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await handleDailyCheckIn(user.id);
    } catch (err) {
      setError('Failed to check in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="daily-checkin">
      {error && <div className="error-message">{error}</div>}
      <button
        onClick={handleCheckIn}
        disabled={checkInStatus || isLoading}
        className={`checkin-button ${checkInStatus ? 'checked' : ''}`}
      >
        {isLoading ? 'Processing...' : 
         checkInStatus ? 'Checked In' : 'Daily Check-In'}
      </button>
    </div>
  );
};

export default DailyCheckIn;
