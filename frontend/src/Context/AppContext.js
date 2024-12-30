import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Create AppContext
const AppContext = createContext();

// AppContext Provider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [psdtBalance, setPsdtBalance] = useState(1000); // Initial balance
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [telegramId, setTelegramId] = useState(''); // Add telegramId state

  useEffect(() => {
    const fetchUserData = async () => {
      if (!walletAddress) return; // Prevent API call if walletAddress is empty
      try {
        const response = await axios.get(`https://backend-proseed.vercel.app/api/users/${walletAddress}`);
        setUser(response.data);
        setPsdtBalance(response.data.psdtBalance || 0); // Handle case where psdtBalance might be undefined
        setTelegramId(response.data.telegramId || ''); // Set telegramId
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [walletAddress]);

  const fetchUserByTelegramId = async (telegramId) => {
    try {
      const response = await fetch(`https://backend-proseed.vercel.app/api/users/byTelegramId/${telegramId}`);
      const userData = await response.json();
      if (response.ok) {
        setUser(userData); // Update user data
        setTelegramId(userData.telegramId); // Set Telegram ID
      } else {
        console.error('Error fetching user by Telegram ID:', userData.message);
      }
    } catch (error) {
      console.error('Error fetching user by Telegram ID:', error);
    }
  };

  const registerUser = async (telegramUser) => {
    try {
      const response = await fetch(`${API_URL}/api/users/registerUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: telegramUser.username, 
          telegramID: telegramUser.id 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      const data = await response.json();
      setUser(data);
      setTelegramId(data.telegramId);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const updateBalance = async (newBalance) => {
    if (!user?._id) {
      throw new Error('User data not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/api/users/updateBalance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, newBalance }),
      });
      
      if (!response.ok) {
        throw new Error('Balance update failed');
      }
      
      const data = await response.json();
      setUser(data);
      setPsdtBalance(newBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  };

  const handleDailyCheckIn = async () => {
    if (!checkInStatus && telegramId) {
      try {
        const response = await fetch(`${API_URL}/api/users/dailyCheckIn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId }),
        });

        if (!response.ok) {
          throw new Error('Check-in failed');
        }

        const data = await response.json();
        setPsdtBalance(data.psdtBalance);
        setCheckInStatus(true);
        return data;
      } catch (error) {
        console.error('Daily check-in failed:', error);
        throw error;
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
      const response = await fetch('https://backend-proseed.vercel.app/api/users/fetchTelegramID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username }),
      });
      const data = await response.json();
      setUser((prevUser) => ({ ...prevUser, telegramID: data.telegramID }));
      setTelegramId(data.telegramID); // Set telegramId
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
        registerUser,
        telegramId, // Include telegramId in context
        setTelegramId, // Include setTelegramId in context
        fetchUserByTelegramId, // Include fetchUserByTelegramId in context
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