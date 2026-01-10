import React, { useState, useEffect } from 'react';
import { CartContext } from './Cart';

// Cung cấp ngữ cảnh giỏ hàng
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    // Tải từ localStorage khi khởi tạo
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Lưu vào localStorage mỗi khi items thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };
  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };
  // Xóa tất cả sản phẩm khỏi giỏ hàng
  const clearCart = () => {
    setItems([]);
  };
  // Tính tổng tiền trong giỏ hàng
  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.gia || 0) * item.quantity, 0);
  };
  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const getTotalQuantity = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
}
