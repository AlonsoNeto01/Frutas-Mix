'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '@/lib/types';

// ============================================
// Actions
// ============================================
type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number; observation: string; addons: import('@/lib/types').AddonItem[] }
  | { type: 'REMOVE_ITEM'; index: number }
  | { type: 'UPDATE_QUANTITY'; index: number; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] };

// ============================================
// State
// ============================================
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const addonsTotal = item.addons?.reduce((s, addon) => s + Number(addon.price), 0) || 0;
    return sum + (Number(item.product.price) + addonsTotal) * item.quantity;
  }, 0);
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Verifica se o item já existe com a mesma observação e mesmos adicionais
      const newAddonsIds = action.addons.map(a => a.id).sort().join(',');
      const existingIndex = state.items.findIndex(
        (item) => {
          const itemAddonsIds = (item.addons || []).map(a => a.id).sort().join(',');
          return item.product.id === action.product.id &&
                 item.observation === action.observation &&
                 itemAddonsIds === newAddonsIds;
        }
      );

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + action.quantity }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          {
            product: action.product,
            quantity: action.quantity,
            observation: action.observation,
            addons: action.addons,
          },
        ];
      }

      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((_, i) => i !== action.index);
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        const newItems = state.items.filter((_, i) => i !== action.index);
        return {
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        };
      }
      const newItems = state.items.map((item, i) =>
        i === action.index ? { ...item, quantity: action.quantity } : item
      );
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };

    case 'LOAD_CART':
      return {
        items: action.items,
        total: calculateTotal(action.items),
        itemCount: calculateItemCount(action.items),
      };

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================
interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: Product, quantity: number, observation: string, addons: import('@/lib/types').AddonItem[]) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  // Carregar do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('frutasmix-cart');
      if (saved) {
        const items = JSON.parse(saved) as CartItem[];
        dispatch({ type: 'LOAD_CART', items });
      }
    } catch {
      // ignore
    }
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('frutasmix-cart', JSON.stringify(state.items));
    } catch {
      // ignore
    }
  }, [state.items]);

  const addItem = (product: Product, quantity: number, observation: string, addons: import('@/lib/types').AddonItem[] = []) => {
    dispatch({ type: 'ADD_ITEM', product, quantity, observation, addons });
  };

  const removeItem = (index: number) => {
    dispatch({ type: 'REMOVE_ITEM', index });
  };

  const updateQuantity = (index: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', index, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
