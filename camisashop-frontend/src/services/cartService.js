// services/cartService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cart';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const cartService = {
  // Obter carrinho do backend
  getCart: async () => {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Adicionar ao carrinho
  addToCart: async (item) => {
    const response = await axios.post(`${API_URL}/add`, item, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Atualizar quantidade
  updateQuantity: async (itemId, quantity) => {
    const response = await axios.put(`${API_URL}/update/${itemId}`, { quantity }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Remover item
  removeItem: async (itemId) => {
    const response = await axios.delete(`${API_URL}/remove/${itemId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Limpar carrinho
  clearCart: async () => {
    const response = await axios.delete(`${API_URL}/clear`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};