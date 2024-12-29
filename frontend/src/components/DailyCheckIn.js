import React from 'react';
import { useAppContext } from '../Context/AppContext.js';

const DailyCheckIn = () => {
  const { handleDailyCheckIn, checkInStatus } = useAppContext();

  return (
    <div>
      <button
        onClick={handleDailyCheckIn}
        disabled={checkInStatus}
      >
        {checkInStatus ? 'Checked In' : 'Daily Check-In'}
      </button>
    </div>
  );
};

export default DailyCheckIn;
