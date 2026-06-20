import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'ejss-cart';

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((item) => item.id === action.payload.id);
      if (existing) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter((item) => item.id !== action.payload);
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return state.filter((item) => item.id !== action.payload.id);
      }
      return state.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
    }
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], () => loadCart());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } });
  };

  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });

  const updateQuantity = (id, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const hasQuoteItems = items.some((item) => item.priceOnRequest);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = hasQuoteItems ? 0 : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = hasQuoteItems ? 0 : subtotal >= 500 ? 0 : subtotal > 0 ? 79.99 : 0;
  const tax = hasQuoteItems ? 0 : subtotal * 0.15;
  const total = subtotal + shipping + tax;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, shipping, tax, total, hasQuoteItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
