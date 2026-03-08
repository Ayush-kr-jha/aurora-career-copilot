'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1>AURORA</h1>
        <p>Your Career Co-Pilot</p>
      </header>

      <div className="ollama-status connected">
        ● Local AI Ready (Ollama)
      </div>

      <div className="chat-container">
        <div className="message aurora">
          <h2>Welcome to Aurora!</h2>
          <p>This is a Progressive Web App (PWA).</p>
          <p>You can install it on your phone by:</p>
          <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
            <li><strong>Android:</strong> Chrome → Menu → Add to Home Screen</li>
            <li><strong>iOS:</strong> Safari → Share → Add to Home Screen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
