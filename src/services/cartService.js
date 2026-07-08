// services/cartService.js
import axios from 'axios';



const CART_KEY = "Lumo_cart";

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const cartService = {
  // Obter carrinho do backend
  getCart: async () => {
    const response = await axios.get('/api/cart', {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Adicionar ao carrinho
  addToCart: async (item) => {

    const response = await axios.post(`/api/cart/add`, item, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Atualizar quantidade
  updateQuantity: async (itemId, quantity) => {
    const response = await axios.put(`/api/cart/update/${itemId}`, { quantity }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Remover item
  removeItem: async (itemId) => {
    const response = await axios.delete(`/api/cart/remove/${itemId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Limpar carrinho
  clearCart: async () => {
    const response = await axios.delete(`/api/cart/clear`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};
