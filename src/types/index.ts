export interface Product {
  id?: string;
  title: string;
  price: number;
  tag: string;
  color: string;
  image: string;
  description?: string;
  category?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  customerName: string;
  email: string;
  phone: string;
  address: string;
  customNotes?: string;
  items: OrderItem[];
  paymentId: string;
  createdAt: any;
}

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

export type Tab = 'products' | 'orders' | 'settings';

export interface Settings {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  bannerText: string;
  bannerButtonText: string;
}
