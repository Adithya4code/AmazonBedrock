import './polyfills.js'; // Import polyfill first
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Polyfill for global (required by aws-sdk in browser environments)
if (typeof global === 'undefined') {
    window.global = window;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);