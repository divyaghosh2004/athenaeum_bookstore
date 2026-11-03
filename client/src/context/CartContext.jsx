import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('guestCart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sync server cart when logged in
  const fetchServerCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.cart) {
        setItems(res.data.cart.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch (err) {
      console.warn('Cart sync warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart();
    } else {
      // Calculate local subtotal
      const sum = items.reduce((acc, item) => {
        const price = item.book?.price || item.priceSnapshot || 0;
        return acc + price * item.quantity;
      }, 0);
      setSubtotal(sum);
      localStorage.setItem('guestCart', JSON.stringify(items));
    }
  }, [isAuthenticated]);

  // Recalculate subtotal whenever items change for guests
  useEffect(() => {
    if (!isAuthenticated) {
      const sum = items.reduce((acc, item) => {
        const price = item.book?.price || item.priceSnapshot || 0;
        return acc + price * item.quantity;
      }, 0);
      setSubtotal(sum);
      localStorage.setItem('guestCart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const addToCart = async (book, quantity = 1) => {
    if (book.stockQuantity < 1) {
      toast.error(`"${book.title}" is out of stock.`);
      return false;
    }

    if (isAuthenticated) {
      try {
        const res = await api.post('/cart/items', {
          bookId: book._id,
          quantity
        });
        if (res.data.success) {
          setItems(res.data.cart.items);
          setSubtotal(res.data.subtotal);
          toast.success(`"${book.title}" added to cart!`);
          return true;
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Could not add to cart';
        toast.error(msg);
        return false;
      }
    } else {
      // Guest cart
      setItems((prev) => {
        const existingIdx = prev.findIndex((it) => (it.book?._id || it.book) === book._id);
        if (existingIdx > -1) {
          const newQty = prev[existingIdx].quantity + quantity;
          if (newQty > book.stockQuantity) {
            toast.error(`Only ${book.stockQuantity} copies available in stock.`);
            return prev;
          }
          const updated = [...prev];
          updated[existingIdx].quantity = newQty;
          toast.success(`Updated "${book.title}" quantity in cart.`);
          return updated;
        } else {
          toast.success(`"${book.title}" added to cart!`);
          return [
            ...prev,
            {
              book,
              quantity,
              priceSnapshot: book.price
            }
          ];
        }
      });
      return true;
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    if (quantity < 1) return;

    if (isAuthenticated) {
      try {
        const res = await api.put(`/cart/items/${bookId}`, { quantity });
        if (res.data.success) {
          setItems(res.data.cart.items);
          setSubtotal(res.data.subtotal);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update quantity');
      }
    } else {
      setItems((prev) =>
        prev.map((it) => {
          if ((it.book?._id || it.book) === bookId) {
            return { ...it, quantity };
          }
          return it;
        })
      );
    }
  };

  const removeFromCart = async (bookId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/items/${bookId}`);
        if (res.data.success) {
          setItems(res.data.cart.items);
          setSubtotal(res.data.subtotal);
          toast.info('Item removed from cart.');
        }
      } catch (err) {
        toast.error('Failed to remove item');
      }
    } else {
      setItems((prev) => prev.filter((it) => (it.book?._id || it.book) !== bookId));
      toast.info('Item removed from cart.');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.warn('Clear cart server error:', err.message);
      }
    }
    setItems([]);
    setSubtotal(0);
    localStorage.removeItem('guestCart');
  };

  const checkoutOrder = async (deliveryAddress, paymentMethod) => {
    const res = await api.post('/orders/checkout', {
      deliveryAddress,
      paymentMethod
    });
    if (res.data.success) {
      setItems([]);
      setSubtotal(0);
      localStorage.removeItem('guestCart');
    }
    return res.data;
  };

  const itemCount = items.reduce((acc, it) => acc + (it.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkoutOrder,
        refreshCart: fetchServerCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

