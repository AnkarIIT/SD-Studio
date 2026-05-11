import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Wishlist from './components/Wishlist';
import OrderHistory from './components/OrderHistory';
import ProductModal from './components/ProductModal';
import CustomLab from './components/CustomLab';
import NewsletterSubscription from './components/NewsletterSubscription';
import ErrorBoundary from './components/ErrorBoundary';
import { Order, Product } from './types';
import { PRODUCTS } from './constants';
import { motion } from 'motion/react';
import { Github, Twitter, Instagram, Layers, Youtube, ArrowUp } from 'lucide-react';
import { useCartStore } from './utils/store';
import toast from 'react-hot-toast';

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Using Zustand store for cart state persistence
  const { items: cartItems, addItem, removeItem, updateQuantity } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product & { quantity?: number }) => {
    if (product.stock === 0 || product.inStock === false) {
      toast.error('This product is out of stock');
      return;
    }

    addItem({
      ...product,
      quantity: product.quantity || 1,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = cartItems.find(cartItem => cartItem.id === id);
    if (!item) return;

    const nextQuantity = item.quantity + delta;
    if (nextQuantity > (item.stock ?? Number.POSITIVE_INFINITY)) {
      toast.error(`Only ${item.stock} available`);
      return;
    }

    updateQuantity(id, nextQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (order: Order) => {
    setIsCheckoutOpen(false);
    setIsOrdersOpen(true);
    toast.success(`Order ${order.id.slice(0, 8).toUpperCase()} confirmed`);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col font-sans">
        <Header 
          cartCount={totalItems}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenOrders={() => setIsOrdersOpen(true)}
        />

        <main className="flex-grow pt-24 md:pt-32 dark:bg-zinc-950">
          <Hero />
          
          <NewsletterSubscription />

          <ProductGrid 
            products={PRODUCTS} 
            onAddToCart={handleAddToCart} 
            onOpenDetail={setSelectedProduct}
          />

          {/* Collection Showcase Section */}
          <section className="py-24 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-900 overflow-hidden rounded">
                  <img 
                    src="https://picsum.photos/seed/minimal/1200/800" 
                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    alt="Precision Selection"
                  />
                  <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent text-white">
                    <h3 className="text-5xl font-serif font-black italic mb-4">Precision Selection</h3>
                    <a href="#catalog" className="font-black uppercase tracking-widest text-xs border-b-2 border-white pb-1 w-fit hover:text-primary hover:border-primary transition-colors">Shop The Lab</a>
                  </div>
                </div>
                <div className="group relative aspect-[16/10] bg-zinc-100 overflow-hidden rounded">
                  <img 
                    src="https://picsum.photos/seed/studio/1200/800" 
                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    alt="Engineering Art"
                  />
                  <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent text-white">
                    <h3 className="text-5xl font-serif font-black italic mb-4">Engineering Art</h3>
                    <a href="#catalog" className="font-black uppercase tracking-widest text-xs border-b-2 border-white pb-1 w-fit hover:text-primary hover:border-primary transition-colors">View Process</a>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <CustomLab />
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 pt-24 pb-12 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-24">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-8">
                  <Layers className="w-8 h-8 text-primary" />
                  <h3 className="text-3xl font-serif font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100">3D by SD</h3>
                </div>
                <p className="text-zinc-500 max-w-sm leading-relaxed font-medium">
                  Premium 3D printed objects engineered for excellence. Precision-crafted designs that blend art and engineering from our state-of-the-art laboratory in India.
                </p>
              </div>
              
              <div>
                <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-zinc-900 dark:text-zinc-100 mb-8 pt-2">Company</h4>
                <ul className="space-y-4 font-bold uppercase text-[11px] text-zinc-500 dark:text-zinc-400 tracking-widest">
                  <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Laboratory</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Sustainability</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-zinc-900 dark:text-zinc-100 mb-8 pt-2">Support</h4>
                <ul className="space-y-4 font-bold uppercase text-[11px] text-zinc-500 dark:text-zinc-400 tracking-widest">
                  <li><a href="#" className="hover:text-primary transition-colors">Track Order</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-zinc-900 dark:text-zinc-100 mb-8 pt-2">Follow Us</h4>
                <div className="flex flex-wrap gap-4">
                  <a href="#" className="w-10 h-10 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all rounded dark:text-zinc-400" title="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all rounded dark:text-zinc-400" title="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all rounded dark:text-zinc-400" title="YouTube">
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all rounded dark:text-zinc-400" title="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                (c) 2026 3D BY SD | All Rights Reserved
              </span>
              <div className="flex gap-8 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a>
                <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full hover:opacity-90 transition-opacity z-50 shadow-lg"
            title="Scroll to top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}

        {/* Cart Drawer */}
        <Cart 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemoveItem}
          onCheckout={handleCheckout}
        />

        {/* Wishlist Drawer */}
        <Wishlist 
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          onAddToCart={handleAddToCart}
        />

        <Checkout
          isOpen={isCheckoutOpen}
          items={cartItems}
          onClose={() => setIsCheckoutOpen(false)}
          onComplete={handleOrderComplete}
        />

        <OrderHistory
          isOpen={isOrdersOpen}
          onClose={() => setIsOrdersOpen(false)}
        />

        {/* Product Details Modal */}
        <ProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#000',
              border: '1px solid #e4e4e7',
            },
            success: {
              style: {
                background: '#dcfce7',
                color: '#166534',
              },
            },
            error: {
              style: {
                background: '#fee2e2',
                color: '#991b1b',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
