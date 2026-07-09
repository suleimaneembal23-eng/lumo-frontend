export const API_URL = process.env.NODE_ENV === 'production'
    ? "https://lumo-backend-api.onrender.com/api"
    : (() => {
        const hostname = window.location.hostname;
        return `http://${hostname}:5000/api`;
    })();
