import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRanking, setUserRanking] = useState(null);

  // Fetching data from the backend
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await fetch('https://backend-proseed.vercel.app/api/leaderboard'); // Updated to actual API endpoint
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Assuming data contains sorted leaderboard and user's rank info
        setLeaderboard(data.leaderboard);
        setUserRanking(data.userRank); // Get specific user's ranking (replace with actual data logic)
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <div className="leaderboard-container">
      {/* User's Ranking Card */}
      {userRanking && (
        <div className="user-ranking-card">
          <h3>Your Ranking</h3>
          <p>Rank: #{userRanking.rank}</p>
          <p>Username: {userRanking.username}</p>
          <p>PSDT Balance: {userRanking.balance}</p>
        </div>
      )}

      {/* Main Leaderboard */}
      <h2>Leaderboard</h2>
      <div className="leaderboard-list">
        {leaderboard.map((user, index) => (
          <div className="leaderboard-card" key={index}>
            <p className="ranking">#{user.rank}</p>
            <p className="username">{user.username}</p>
            <p className="balance">{user.balance} PSDT</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

