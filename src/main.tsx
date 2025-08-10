import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'

// Component-specific styles
import './components/TargetCursor.css';
import './components/TiltedCard.css';
import './components/Dock.css';
import './components/Counter.css';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
