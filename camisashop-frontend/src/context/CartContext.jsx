import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./Authcontext";
import { cartService } from "../services/cartService";
import { message } from "antd";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [cart, setCart] = useState(null); // null = não carregado ainda
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0); // para badge do carrinho

  // Carrega carrinho do backend quando user muda
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setCart(null);
        setCartCount(0);
        return;
      }

      try {
        setLoading(true);
        const data = await cartService.getCart();
        setCart(data);
        setCartCount(data.items?.length || 0);
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        // Se der erro, cria carrinho vazio
        setCart({ items: [] });
        setCartCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Adicionar ao carrinho
  const addToCart = async (product) => {
    if (!user) {
      message.warning("Faça login para adicionar produtos ao carrinho!");
      return false;
    }

    try {
      setLoading(true);
      const updatedCart = await cartService.addToCart({
        productId: product.id || product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        selectedSize: product.selectedSize,
        quantity: product.quantity || 1
      });
      
      setCart(updatedCart);
      setCartCount(updatedCart.items?.length || 0);
      message.success("Produto adicionado ao carrinho!");
      return true;
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      message.error("Erro ao adicionar ao carrinho");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar quantidade
  const updateQuantity = async (itemId, quantity) => {
    if (!user) return false;

    try {
      setLoading(true);
      const updatedCart = await cartService.updateQuantity(itemId, quantity);
      setCart(updatedCart);
      setCartCount(updatedCart.items?.length || 0);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      message.error("Erro ao atualizar quantidade");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remover item
  const removeItem = async (itemId) => {
    if (!user) return false;

    try {
      setLoading(true);
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
      setCartCount(updatedCart.items?.length || 0);
      message.success("Item removido do carrinho");
      return true;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      message.error("Erro ao remover item");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Limpar carrinho
  const clearCart = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
      setCartCount(0);
      message.success("Carrinho limpo");
      return true;
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      message.error("Erro ao limpar carrinho");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calcular total
  const getTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart: cart?.items || [], // Mantém compatibilidade com código antigo
        cartData: cart, // Dados completos do carrinho (com _id, userId, etc)
        cartCount,
        loading,
        addToCart, 
        updateQuantity, 
        removeItem,
        clearCart,
        getTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};