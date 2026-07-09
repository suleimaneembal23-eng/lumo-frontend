import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SettingsProvider } from "./context/SettingsContext";

// ⬇️ Global interceptor to route all /api/ requests directly to Render
import axios from 'axios';
import { API_URL } from './config';

axios.defaults.baseURL = API_URL.replace('/api', '');

const originalFetch = window.fetch;
window.fetch = function(...args) {
    let [resource, config] = args;
    if (typeof resource === 'string' && resource.startsWith('/api/')) {
        resource = API_URL.replace('/api', '') + resource;
        args[0] = resource;
    }
    return originalFetch(...args);
};
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
);

// Optional performance measuring
reportWebVitals();
