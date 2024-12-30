import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './Context/AppContext.js';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticateUser = async () => {
    if (!webApp?.initData) return;
    
    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: webApp.initData }),
      });
      
      const data = await response.json();
      setIsAuthenticated(data.success);
      
      if (data.success && user?.id) {
        await fetchUserData(user.id);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

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