import { CartItem, User, WishlistItem } from '../types';

const STORAGE_KEYS = {
  CART: 'lb_cart',
  WISHLIST: 'lb_wishlist',
  USER: 'lb_user',
  AUTH_TOKEN: 'lb_auth_token',
  RECENT_PRODUCTS: 'lb_recent_products',
};

/**
 * Cart Management
 */
export const cartStorage = {
  getCart: (): CartItem[] => {
    try {
      const cart = localStorage.getItem(STORAGE_KEYS.CART);
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  },

  setCart: (cart: CartItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  },

  clearCart: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CART);
  },
};

/**
 * Wishlist Management
 */
export const wishlistStorage = {
  getWishlist: (): string[] => {
    try {
      const wishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return wishlist ? JSON.parse(wishlist) : [];
    } catch {
      return [];
    }
  },

  setWishlist: (wishlist: string[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  },

  addToWishlist: (productId: string): void => {
    const wishlist = wishlistStorage.getWishlist();
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      wishlistStorage.setWishlist(wishlist);
    }
  },

  removeFromWishlist: (productId: string): void => {
    const wishlist = wishlistStorage.getWishlist();
    wishlistStorage.setWishlist(wishlist.filter(id => id !== productId));
  },

  isInWishlist: (productId: string): boolean => {
    return wishlistStorage.getWishlist().includes(productId);
  },

  clearWishlist: (): void => {
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
  },
};

/**
 * User Management
 */
export const userStorage = {
  getUser: (): User | null => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user:', e);
    }
  },

  clearUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};

/**
 * Auth Token Management
 */
export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  clearToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};

/**
 * Recently Viewed Products
 */
export const recentProductsStorage = {
  getRecentProducts: (): string[] => {
    try {
      const products = localStorage.getItem(STORAGE_KEYS.RECENT_PRODUCTS);
      return products ? JSON.parse(products) : [];
    } catch {
      return [];
    }
  },

  addRecentProduct: (productId: string): void => {
    try {
      let recent = recentProductsStorage.getRecentProducts();
      recent = recent.filter(id => id !== productId);
      recent.unshift(productId);
      recent = recent.slice(0, 10); // Keep only last 10
      localStorage.setItem(STORAGE_KEYS.RECENT_PRODUCTS, JSON.stringify(recent));
    } catch (e) {
      console.error('Failed to save recent product:', e);
    }
  },

  clearRecentProducts: (): void => {
    localStorage.removeItem(STORAGE_KEYS.RECENT_PRODUCTS);
  },
};
