import React, { useState, useEffect } from 'react';
import { useAppContext } from '../Context/AppContext';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import { FaTelegram, FaTwitter, FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import './Earn.css';
import NavigationBar from './NavigationBar.js';  // Add .js extension

const Earn = () => {
  const { psdtBalance, setPsdtBalance } = useAppContext();
  const { user } = useTelegramWebApp();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [referralLink, setReferralLink] = useState('');
  const [activeTab, setActiveTab] = useState('Direct Tasks');
  const [isClaiming, setIsClaiming] = useState(false); // Add state for claiming

  const directTasks = [
    {
      icon: <FaTelegram />,
      task: 'Join proSEED Telegram Channel',
      link: 'https://t.me/+oT_BLMaqF705YzJk',
      rewards: 500,
    },
    {
      icon: <FaTelegram />,
      task: 'Join proSEED Telegram Chat',
      link: 'https://t.me/+cjO1BRKaEhM2OTY0',
      rewards: 500,
    },
    {
      icon: <FaTwitter />,
      task: 'Follow proSEED on X',
      link: 'https://x.com/proSEED_Eng',
      rewards: 500,
    },
    {
      icon: <FaYoutube />,
      task: 'Subscribe to our YouTube Channel',
      link: 'https://www.youtube.com/@proSEED_Official',
      rewards: 500,
    },
    {
      icon: <FaInstagram />,
      task: 'Follow proSEED on Instagram',
      link: 'https://www.instagram.com/proseed_en?igsh=MWtmbHI2aHd2c3JsNg%3D%3D&utm_source=qr',
      rewards: 500,
    },
    {
      icon: <FaTiktok />,
      task: 'Follow proSEED on TikTok',
      link: 'https://www.tiktok.com/@proseed_official?_t=8rWX3rQiphX&_r=1',
      rewards: 500,
    },
  ];

  const indirectTasks = [
    {
      host: 'The Open Network',
      link: 'https://t.me/tapps/app?startapp=ref_1_39168',
      rewards: '10,000 TON Prize Pool',
    },
    {
      host: 'TractionEye',
      link: 'https://t.me/TractionEyebot/app?startapp=ref_S4XK7K',
      rewards: 'Token Airdrop',
    },
    {
      host: 'ClickBit Wallet',
      link: 'www.clickbit.cash',
      rewards: 'Earn Bits and convert to $Click token',
    },
    {
      host: 'G-SHAKE',
      link: 'https://t.me/gshake_bot/game?startapp=nCtTTYPDcW',
      rewards: 'Earn Memecoins and other gifts freely',
    },
    {
      host: 'TaleX',
      link: 'https://t.me/TaleX_chain_bot',
      rewards: 'Collection of Rewards',
    },
  ];

  const referralRewards = [
    { range: '1 to 10 referrals', reward: 1000 },
    { range: '11 to 20 referrals', reward: 3000 },
    { range: '21 to 50 referrals', reward: 5000 },
    { range: '51 to 100 referrals', reward: 10000 },
    { range: '100 to 1,000 referrals', reward: 25000 },
  ];

  const generateReferralLink = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/users/generateReferral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.id })
      });

      const data = await response.json();
      setReferralLink(data.referralLink);
    } catch (error) {
      console.error('Error generating referral link:', error);
    }
  };

  const claimReferralReward = async () => {
    setIsClaiming(true); // Set claiming state to true
    const rewards = referralRewards.find(r => referralCount >= r.range.split(' ')[0]);
    
    if (rewards) {
      try {
        const response = await fetch('/api/users/referral/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, reward: rewards.reward })
        });
        const data = await response.json();
        setPsdtBalance(data.newBalance);
        alert('Referral reward claimed successfully!'); // Show success message
      } catch (error) {
        console.error('Error claiming referral reward:', error);
        alert('Error claiming referral reward. Please try again later.'); // Show error message
      } finally {
        setIsClaiming(false); // Reset claiming state
      }
    } else {
      setIsClaiming(false); // Reset claiming state if no rewards found
    }
  };

  const completeTask = async (taskIndex) => {
    if (!user?.id || completedTasks.includes(taskIndex)) return;

    try {
      const response = await fetch('/api/users/completeTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.id,
          taskIndex,
          reward: directTasks[taskIndex].rewards
        })
      });

      const data = await response.json();
      if (data.success) {
        setPsdtBalance(prev => prev + directTasks[taskIndex].rewards);
        setCompletedTasks(prev => [...prev, taskIndex]);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const renderDirectTasks = () =>
    directTasks.map((task, index) => (
      <div className="task-card" key={index}>
        <div className="task-icon">{task.icon}</div>
        <div className="task-content">
          <h3>{task.task}</h3>
          <p>Reward: +{task.rewards} PSDT</p>
          {completedTasks.includes(index) ? (
            <button className="task-button completed" disabled>
              Completed
            </button>
          ) : (
            <button 
              className="task-button"
              onClick={() => {
                window.open(task.link, '_blank');
                completeTask(index);
              }}
            >
              Complete Task
            </button>
          )}
        </div>
      </div>
    ));

  const renderIndirectTasks = () =>
    indirectTasks.map((task, index) => (
      <div className="task-card" key={index}>
        <h3>Host: {task.host}</h3>
        <p>Rewards: {task.rewards}</p>
        <a href={task.link} target="_blank" rel="noopener noreferrer">
          Participate Now
        </a>
      </div>
    ));

  const renderReferralTasks = () =>
    referralRewards.map((reward, index) => (
      <div className="referral-task-card" key={index}>
        <h3>{reward.range}</h3>
        <p>Reward: +{reward.reward} PSDT</p>
        <button 
          onClick={claimReferralReward}
          disabled={isClaiming || referralCount < 5}
        >
          {isClaiming ? 'Claiming...' : 'Claim Referral Reward'}
        </button>
      </div>
    ));

  return (
    <div>
      {/* Include NavigationBar for navigation */}
      <NavigationBar />

      <div className="earn-container">
        {/* Navigation Bar for toggling */}
        <div className="nav-tabs">
          <button
            className={activeTab === 'Direct Tasks' ? 'active-tab' : ''}
            onClick={() => setActiveTab('Direct Tasks')}
          >
            Direct Tasks
          </button>
          <button
            className={activeTab === 'Indirect Tasks' ? 'active-tab' : ''}
            onClick={() => setActiveTab('Indirect Tasks')}
          >
            Indirect Tasks
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="tasks-content">
          {activeTab === 'Direct Tasks' ? renderDirectTasks() : renderIndirectTasks()}
        </div>

        {/* Referral Link Feature */}
        <div className="referral-section">
          <h2>Referral Link</h2>
          <p>Share your referral link to earn more rewards.</p>
          <button className="generate-link" onClick={generateReferralLink}>Generate Referral Link</button>
          {referralLink && (
            <div className="referral-link">
              <p>Your Referral Link:</p>
              <input readOnly value={referralLink} />
              <button onClick={() => navigator.clipboard.writeText(referralLink)}>
                Copy
              </button>
            </div>
          )}
          <div className="referral-stats">
            <p>Referral Count: {referralCount}</p>
            <button 
              onClick={claimReferralReward}
              disabled={isClaiming || referralCount < 5}
              className={referralCount >= 5 ? 'ready' : 'disabled'}
            >
              Claim Referral Reward
            </button>
          </div>
        </div>

        {/* Referral Rewards */}
        <div className="referral-rewards">
          <h2>Referral Rewards</h2>
          {renderReferralTasks()}
        </div>
      </div>
    </div>
  );
};

export default Earn;