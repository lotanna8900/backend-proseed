import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';  // Add .js extension
import './index.css';  // No change needed

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Target container 'root' not found in the HTML file.");
}


