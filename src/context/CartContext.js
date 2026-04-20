import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((newItem) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.listing_id === newItem.listing_id);
      if (exists) {
        return prev.map(i =>
          i.listing_id === newItem.listing_id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((listing_id) => {
    setCartItems(prev => prev.filter(i => i.listing_id !== listing_id));
  }, []);

  const updateQuantity = useCallback((listing_id, quantity) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(i => i.listing_id !== listing_id));
    } else {
      setCartItems(prev =>
        prev.map(i => i.listing_id === listing_id ? { ...i, quantity } : i)
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);

  // Group items by wholesaler
  const cartByWholesaler = cartItems.reduce((acc, item) => {
    const key = item.wholesaler_id;
    if (!acc[key]) acc[key] = { wholesaler_id: key, wholesaler_name: item.wholesaler_name, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      cartByWholesaler,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
