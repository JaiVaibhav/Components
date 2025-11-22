import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("cart:v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart:v1", JSON.stringify(items));
    } catch {}
  }, [items]);

  function addToCart(product, qty = 1) {
    setItems((cur) => {
      const idx = cur.findIndex((c) => c.id === product.id);
      if (idx >= 0) {
        const next = [...cur];
        next[idx].qty += qty;
        return next;
      }
      return [...cur, { id: product.id, product, qty }];
    });
  }

  function updateQty(id, qty) {
    setItems((cur) => cur.map((c) => (c.id === id ? { ...c, qty } : c)));
  }

  function removeFromCart(id) {
    setItems((cur) => cur.filter((c) => c.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  const value = { items, addToCart, updateQty, removeFromCart, clearCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
