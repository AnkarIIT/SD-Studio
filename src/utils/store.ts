import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Order, User } from '../types';
import { userStorage, authStorage } from './storage';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

interface WishlistStore {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status'], paymentId?: string) => void;
  clearOrders: () => void;
}

interface FilterStore {
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'newest' | 'price-asc' | 'price-desc' | 'popular') => void;
  reset: () => void;
}

/**
 * Cart Store
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(i => i.id === item.id);
        const stock = item.stock ?? Number.POSITIVE_INFINITY;
        if (existingItem) {
          const nextQuantity = Math.min(existingItem.quantity + item.quantity, stock);
          set({
            items: items.map(i =>
              i.id === item.id ? { ...i, quantity: nextQuantity } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: Math.min(item.quantity, stock) }] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(item => item.id !== id) });
        } else {
          set({
            items: get().items.map(item =>
              item.id === id ? { ...item, quantity: Math.min(quantity, item.stock ?? quantity) } : item
            ),
          });
        }
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

/**
 * Wishlist Store
 */
export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        const items = get().items;
        if (!items.includes(productId)) {
          set({ items: [...items, productId] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(id => id !== productId) });
      },
      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

/**
 * User Store
 */
export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      userStorage.setUser(user);
      authStorage.setToken('dummy_token');
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    userStorage.clearUser();
    authStorage.clearToken();
  },
}));

/**
 * Order Store
 */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      updateOrderStatus: (id, status, paymentId) => {
        const now = new Date().toISOString();
        set({
          orders: get().orders.map(order =>
            order.id === id ? { ...order, status, paymentId, updatedAt: now } : order
          ),
        });
      },
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: 'order-storage',
    }
  )
);

/**
 * Filter Store
 */
export const useFilterStore = create<FilterStore>()((set) => ({
  selectedCategory: 'All Categories',
  searchQuery: '',
  sortBy: 'newest',
  setCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  reset: () => {
    set({
      selectedCategory: 'All Categories',
      searchQuery: '',
      sortBy: 'newest',
    });
  },
}));
