import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './Context/AppContext.js';
import Home from './components/Home.js';
import Opportunity from './components/Opportunity.js';
import Earn from './components/Earn.js';
import Leaderboard from './components/Leaderboard.js';
import Wallet from './components/Wallet.js';
import NavigationBar from './components/NavigationBar.js';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';
import './App.css';

function App() {
  const { webApp, user, isLoading, error } = useTelegramWebApp();
  const { authenticateUser } = useAppContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    authenticateUser();
  }, [authenticateUser]);

  const fetchUserData = async (telegramId) => {
    try {
      const response = await fetch(`/api/users/telegram/${telegramId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (webApp && user) {
      authenticateUser();
    }
  }, [webApp, user]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <AppProvider>
      <Router>
        <NavigationBar />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/opportunity" element={<Opportunity />} />
            <Route path="/earn" element={<Earn />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/wallet" element={<Wallet />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;