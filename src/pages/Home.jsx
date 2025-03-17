import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Stellar Wallet</h1>
      <div className="features-section">
        <h2>Features</h2>
        <ul>
          <li>Create Stellar wallet</li>
          <li>Send and receive payments</li>
          <li>Check account balance</li>
          <li>View transaction history</li>
        </ul>
      </div>
      <div className="network-info">
        <p>Connected to: {process.env.REACT_APP_STELLAR_NETWORK}</p>
      </div>
    </div>
  );
};

export default Home; 