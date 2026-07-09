export const API_URL = process.env.NODE_ENV === 'production'
    ? "/api"
    : (() => {
        const hostname = window.location.hostname;
        return `http://${hostname}:5000/api`;
    })();
