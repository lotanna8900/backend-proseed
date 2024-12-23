import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './Context/AppContext.js';  // Add .js extension
import Home from './components/Home.js';  // Add .js extension
import Opportunity from './components/Opportunity.js';  // Add .js extension
import Earn from './components/Earn.js';  // Add .js extension
import Leaderboard from './components/Leaderboard.js';  // Add .js extension
import Wallet from './components/Wallet.js';  // Add .js extension
import NavigationBar from './components/NavigationBar.js';  // Add .js extension
import './App.css';

function App() {
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

