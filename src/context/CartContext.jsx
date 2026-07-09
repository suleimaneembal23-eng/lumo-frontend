import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./Authcontext";
import { cartService } from "../services/cartService";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Load Cart (Backend or LocalStorage)
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Logged User: Fetch from Backend
        try {
          const data = await cartService.getCart();
          // If backend returns null or empty, ensure structure
          setCart(data || { items: [] });
          setCartCount(data?.items?.length || 0);

          // Optional: Merge local cart to backend on login could go here
        } catch (error) {
          console.error('Erro ao carregar carrinho do backend:', error);
          setCart({ items: [] });
        }
      } else {
        // Guest User: Fetch from LocalStorage
        try {
          const localCart = localStorage.getItem("guest_cart");
          if (localCart) {
            const parsedCart = JSON.parse(localCart);
            setCart(parsedCart);
            setCartCount(parsedCart.items?.length || 0);
          } else {
            setCart({ items: [] });
            setCartCount(0);
          }
        } catch (err) {
          console.error("Erro ao carregar carrinho local:", err);
          setCart({ items: [] });
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Helper to save local cart
  const saveLocalCart = (newCart) => {
    localStorage.setItem("guest_cart", JSON.stringify(newCart));
    setCart(newCart);
    setCartCount(newCart.items?.length || 0);
  };

  const addToCart = async (product) => {
    setLoading(true);
    let success = false;

    if (user) {
      // Backend
      try {
        const updatedCart = await cartService.addToCart({
          productId: product.id || product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          selectedSize: product.selectedSize,
          quantity: product.quantity || 1,
          customization: product.customization, // âœ… Pass customization
          shopId: product.shopId,
          shopName: product.shopName
        });
        setCart(updatedCart);
        setCartCount(updatedCart.items?.length || 0);
        success = true;
      } catch (error) {
        console.error('Erro ao adicionar ao carrinho (backend):', error);
      }
    } else {
      // LocalStorage (Guest)
      try {
        const currentItems = [...(cart.items || [])];
        const existingItemIndex = currentItems.findIndex(
          item => item.productId === (product.id || product._id) && item.selectedSize === product.selectedSize
        );

        if (existingItemIndex > -1) {
          currentItems[existingItemIndex].quantity += (product.quantity || 1);
        } else {
          currentItems.push({
            productId: product.id || product._id, // Normalize ID
            _id: Date.now().toString(), // Temp ID for frontend
            name: product.name,
            image: product.image,
            image: product.image,
            price: product.price,
            selectedSize: product.selectedSize,
            quantity: product.quantity || 1,
            customization: product.customization, // âœ… Pass customization
            shopId: product.shopId,
            shopName: product.shopName
          });
        }

        saveLocalCart({ items: currentItems });
        success = true;
      } catch (err) {
        console.error("Erro ao adicionar ao carrinho (local):", err);
      }
    }
    setLoading(false);
    return success;
  };

  const updateQuantity = async (itemId, quantity) => {
    setLoading(true);
    if (user) {
      try {
        const updatedCart = await cartService.updateQuantity(itemId, quantity);
        setCart(updatedCart);
        setCartCount(updatedCart.items?.length || 0);
      } catch (error) {
        console.error('Update qty error:', error);
      }
    } else {
      const currentItems = cart.items.map(item => {
        // Local items might use _id or productId logic. 
        // For guests, we assigned a temp _id in addToCart.
        if (item._id === itemId || item.productId === itemId) {
          return { ...item, quantity };
        }
        return item;
      });
      saveLocalCart({ items: currentItems });
    }
    setLoading(false);
    return true;
  };

  const removeItem = async (itemId) => {
    setLoading(true);
    if (user) {
      try {
        const updatedCart = await cartService.removeItem(itemId);
        setCart(updatedCart);
        setCartCount(updatedCart.items?.length || 0);
      } catch (error) {
        console.error('Remove item error:', error);
      }
    } else {
      const currentItems = cart.items.filter(item => item._id !== itemId && item.productId !== itemId);
      saveLocalCart({ items: currentItems });
    }
    setLoading(false);
    return true;
  };

  const clearCart = async () => {
    setLoading(true);
    if (user) {
      try {
        const updatedCart = await cartService.clearCart();
        setCart(updatedCart);
        setCartCount(0);
      } catch (error) {
        console.error('Clear cart error:', error);
      }
    } else {
      saveLocalCart({ items: [] });
    }
    setLoading(false);
    return true;
  };

  const getTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart: cart?.items || [],
        cartData: cart,
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
