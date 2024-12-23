import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create AppContext
const AppContext = createContext();

// AppContext Provider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [psdtBalance, setPsdtBalance] = useState(1000); // Initial balance
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!walletAddress) return; // Prevent API call if walletAddress is empty
      try {
        const response = await axios.get(`https://backend-proseed.vercel.app/api/users/${walletAddress}`);
        setUser(response.data);
        setPsdtBalance(response.data.psdtBalance || 0); // Handle case where psdtBalance might be undefined
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [walletAddress]);

  const registerUserAutomatically = async (telegramUser) => {
    try {
      const response = await fetch('https://backend-proseed.vercel.app/api/registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: telegramUser.username, telegramID: telegramUser.id }),
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const updateBalance = async (newBalance) => {
    if (!user || !user._id) {
      console.error('User data not available for balance update.');
      return;
    }
    try {
      const response = await fetch('https://backend-proseed.vercel.app/api/updateBalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, newBalance }),
      });
      const data = await response.json();
      setUser(data);
      setPsdtBalance(newBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const handleDailyCheckIn = async () => {
    if (!checkInStatus) {
      const newBalance = psdtBalance + 100;
      try {
        await fetch('https://backend-proseed.vercel.app/api/updateBalance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, newBalance }),
        });
        setPsdtBalance(newBalance);
        setCheckInStatus(true);
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  useEffect(() => {
    const resetCheckInStatus = () => {
      setCheckInStatus(false);
    };

    const checkMidnight = () => {
      const now = new Date();
      const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
      setTimeout(resetCheckInStatus, millisTillMidnight);
    };

    checkMidnight();
  }, []);

  const connectWallet = (address) => {
    setWalletAddress(address);
  };

  const fetchTelegramID = async () => {
    try {
      const response = await fetch('https://backend-proseed.vercel.app/api/fetchTelegramID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username }),
      });
      const data = await response.json();
      setUser((prevUser) => ({ ...prevUser, telegramID: data.telegramID }));
    } catch (error) {
      console.error('Error fetching Telegram ID:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        psdtBalance,
        setPsdtBalance, // Ensure this is included here
        walletAddress,
        loading,
        connectWallet,
        updateBalance,
        fetchTelegramID,
        handleDailyCheckIn,
        checkInStatus,
        registerUserAutomatically,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};