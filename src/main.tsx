import { createRoot } from 'react-dom/client'

import './index.css'
// In src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Correct import for global styles
import './App.css';   // Another correct import for global styles

createRoot(document.getElementById("root")!).render(<App />);
