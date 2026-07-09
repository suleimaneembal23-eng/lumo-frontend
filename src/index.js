import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ⬇️ Global interceptor to route all /api/ requests directly to Render
import axios from 'axios';
import { API_URL } from './config';

axios.defaults.baseURL = API_URL.replace('/api', '');

const originalFetch = window.fetch;
window.fetch = function() {
    let [resource, config] = arguments;
    if (typeof resource === 'string' && resource.startsWith('/api/')) {
        resource = API_URL.replace('/api', '') + resource;
    }
    return originalFetch(resource, config);
};

// ⬇️ IMPORTANTE: importar o SettingsProvider
import { SettingsProvider } from "./context/SettingsContext";

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
