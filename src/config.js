export const API_URL = (() => {
    const hostname = window.location.hostname;
    // Se estiver rodando no localhost ou IP local (rede), aponta para a porta do backend
    // Assumindo que o backend roda na mesma mÃ¡quina na porta 5000
    return `http://${hostname}:5000/api`;
})();
