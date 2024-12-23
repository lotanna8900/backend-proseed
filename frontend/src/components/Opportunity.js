import React, { useState } from 'react';
import './Opportunity.css';
import NavigationBar from './NavigationBar.js';  // Add .js extension

const Opportunity = () => {
  const [activeTab, setActiveTab] = useState('Collaborations');

  const collaborations = [
    {
      position: 'Content Creator at proSEED',
      description: 'A unified crypto space for everything crypto.',
      link: 'https://docs.google.com/forms/d/e/1FAIpQLSf9nlcTKJ07tt4XGOat6hxGwxSN__eEZno3IBp55_tMbYY7rA/viewform',
    },
    {
      position: 'Key Opinion Leader at proSEED',
      description: 'A unified crypto space for everything crypto.',
      link: 'https://docs.google.com/forms/d/e/1FAIpQLSf9nlcTKJ07tt4XGOat6hxGwxSN__eEZno3IBp55_tMbYY7rA/viewform',
    },
    {
      position: 'Freelancer at proSEED',
      description: 'A unified crypto space for everything crypto.',
      link: 'https://docs.google.com/forms/d/e/1FAIpQLSf9nlcTKJ07tt4XGOat6hxGwxSN__eEZno3IBp55_tMbYY7rA/viewform',
    },
    {
      position: 'Ambassador Program at proSEED',
      description: 'A unified crypto space for everything crypto.',
      link: 'https://docs.google.com/forms/d/e/1FAIpQLScB196zCo-juoCPf_ETbAfTkVkP_Y3-psTyWrUerHtxPmqcuQ/viewform',
    },
    {
      position: 'Leader at proSEED',
      description: 'A unified crypto space for everything crypto.',
      link: 'https://docs.google.com/forms/d/e/1FAIpQLScwknm7afxQCLDSGBSvyc7HrtqEmsG34gb4asgNOnhTLBgV7Q/viewform',
    },
  ];

  const jobs = [
    {
      position: 'Software Engineer at EXO Labs',
      description: 'AI on any device.',
      link: 'https://exolabs.net/',
    },
    {
      position: 'Product Manager at Omada',
      description: 'On a mission to inspire and engage people in lifelong health.',
      link: 'https://job-boards.greenhouse.io/omadahealth/jobs/6251560',
    },
    {
      position: 'Product Designer at Solayer',
      description: 'A restaking network on Solana.',
      link: 'https://jobs.solana.com/companies/solayer-labs/jobs/41878825-product-designer#content',
    },
    {
      position: 'Account Executive at Cision',
      description: 'A world-changing company.',
      link: 'https://jobs.lever.co/cision/2060e02a-6db2-4d32-a822-5cc32d7786e5/apply?lever-origin=applied&lever-source=xhiring',
    },
  ];

  const renderCollaborations = () =>
    collaborations.map((collab, index) => (
      <div className="opportunity-card" key={index}>
        <h3>{collab.position}</h3>
        <p>{collab.description}</p>
        <a href={collab.link} target="_blank" rel="noopener noreferrer" className="apply-button">
          Apply
        </a>
      </div>
    ));

  const renderJobs = () =>
    jobs.map((job, index) => (
      <div className="opportunity-card" key={index}>
        <h3>{job.position}</h3>
        <p>{job.description}</p>
        <a href={job.link} target="_blank" rel="noopener noreferrer" className="apply-button">
          Apply
        </a>
      </div>
    ));

  return (
    <div>
      <NavigationBar />
      <div className="opportunity-container">
        <div className="nav-tabs">
          <button
            className={activeTab === 'Collaborations' ? 'active-tab' : ''}
            onClick={() => setActiveTab('Collaborations')}
          >
            Collaborations
          </button>
          <button
            className={activeTab === 'Jobs' ? 'active-tab' : ''}
            onClick={() => setActiveTab('Jobs')}
          >
            Jobs
          </button>
        </div>
        <div className="opportunity-content">
          {activeTab === 'Collaborations' ? renderCollaborations() : renderJobs()}
        </div>
      </div>
    </div>
  );
};

export default Opportunity;

