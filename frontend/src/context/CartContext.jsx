import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('sevimler_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sevimler_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  // 💰 Toplam Fiyat Hesaplama
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // ⚖️ Toplam Kilo Hesaplama
  // Ürünlerin miktarını (quantity) doğrudan kilo olarak kabul ediyoruz.
  const totalWeight = cart.reduce((acc, item) => acc + item.quantity, 0);

  // 🚫 Ödeme Yapılabilir mi? (3 kg sınırı)
  const isEligibleForCheckout = totalWeight >= 3;

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        total, 
        totalWeight,           // Yeni: Toplam kilo bilgisini dışarı açtık
        isEligibleForCheckout  // Yeni: Ödeme izni bilgisini dışarı açtık
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
