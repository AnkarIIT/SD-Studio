export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'Home Decor' | 'Art' | 'Tech' | 'Toys';
  image: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  stock?: number;
  inStock?: boolean;
  specs?: {
    material: string;
    dimensions: string;
    printTime: string;
  };
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'upi' | 'card' | 'bank_transfer';
  paymentId?: string;
  couponCode?: string;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
  wishlist?: string[];
  addresses?: Address[];
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}
