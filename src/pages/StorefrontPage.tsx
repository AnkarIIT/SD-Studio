import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HeaderReplica from '../components/HeaderReplica';
import HeroReplica from '../components/HeroReplica';
import ProductGrid from '../components/ProductGrid';
import MarqueeReplica from '../components/MarqueeReplica';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';
import Wishlist from '../components/Wishlist';
import OrderHistory from '../components/OrderHistory';

import HowItWorksReplica from '../components/HowItWorksReplica';
import UploadEstimatorReplica from '../components/UploadEstimatorReplica';
import ReasonsReplica from '../components/ReasonsReplica';
import ReviewsReplica from '../components/ReviewsReplica';
import ClosingCTAReplica from '../components/ClosingCTAReplica';

import FooterReplica from '../components/FooterReplica';
import ErrorBoundary from '../components/ErrorBoundary';
import { Order, Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import { fetchSiteConfigFromServer } from '../utils/catalogApi';
import { motion } from 'motion/react';
import { Layers, ArrowUp } from 'lucide-react';
import { useCartStore, useFilterStore } from '../utils/store';
import { useSiteSettings } from '../utils/siteSettings';
import toast from 'react-hot-toast';
import { initNotificationMode } from '../utils/notificationMode';
import { BRAND_NAME } from '../brand';

export default function StorefrontPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const setCategory = useFilterStore((s) => s.setCategory);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const maintenanceMode = useSiteSettings((s) => s.maintenanceMode);
  const updateSiteSettings = useSiteSettings((s) => s.update);

  const { products, loading: catalogLoading } = useProducts();
  const { items: cartItems, addItem, removeItem, updateQuantity } = useCartStore();

  useEffect(() => {
    if (catalogLoading) return;
    const catalogIds = new Set(products.map((p) => p.id));
    for (const item of useCartStore.getState().items) {
      const catalogProduct = products.find((p) => p.id === item.id);
      if (
        !catalogIds.has(item.id) ||
        catalogProduct?.inStock === false ||
        catalogProduct?.stock === 0
      ) {
        removeItem(item.id);
      }
    }
  }, [products, catalogLoading, removeItem]);

  useEffect(() => {
    initNotificationMode();
    fetchSiteConfigFromServer().then(({ config }) => {
      if (config) updateSiteSettings(config);
    });
  }, [updateSiteSettings]);

  useEffect(() => {
    const category = searchParams.get('category');
    const track = searchParams.get('track');
    const cart = searchParams.get('cart');
    const wishlist = searchParams.get('wishlist');
    let changed = false;

    if (category) {
      setCategory(category);
      changed = true;
      window.setTimeout(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    if (track === 'orders') {
      setIsOrdersOpen(true);
      changed = true;
    }
    if (cart === '1') {
      setIsCartOpen(true);
      changed = true;
    }
    if (wishlist === '1') {
      setIsWishlistOpen(true);
      changed = true;
    }

    if (changed) {
      const next = new URLSearchParams(searchParams);
      next.delete('category');
      next.delete('track');
      next.delete('cart');
      next.delete('wishlist');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setCategory, setSearchParams]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleAddToCart = (product: Product & { quantity?: number }) => {
    if (product.stock === 0 || product.inStock === false) {
      toast.error('This product is out of stock');
      return;
    }
    addItem({ ...product, quantity: product.quantity || 1 });
    toast.success(`${product.name} added to cart`);
  };

  const handleOpenProductDetail = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    if (!item) return;
    const nextQuantity = item.quantity + delta;
    if (nextQuantity > (item.stock ?? Number.POSITIVE_INFINITY)) {
      toast.error(`Only ${item.stock} available`);
      return;
    }
    updateQuantity(id, nextQuantity);
  };

  const handleOrderComplete = (order: Order) => {
    setIsCheckoutOpen(false);
    setIsOrdersOpen(true);
    toast.success(`Order ${order.id.slice(0, 8).toUpperCase()} confirmed`);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <Layers className="w-12 h-12 text-primary mb-6" />
        <h1 className="text-2xl font-bold mb-2">We&apos;ll be back soon</h1>
        <p className="text-zinc-400 max-w-md mb-8">
          {BRAND_NAME} is undergoing maintenance. Orders resume shortly.
        </p>
        <Link to="/admin-control-7x9k2m4p" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
          Admin access
        </Link>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col font-sans">
        <HeaderReplica onOpenCart={() => setIsCartOpen(true)} onOpenOrders={() => setIsOrdersOpen(true)} />

        <main className="flex-grow shop-page-bg">
          <HeroReplica />
          <ProductGrid
            products={products}
            loading={catalogLoading}
            onAddToCart={handleAddToCart}
            onOpenDetail={handleOpenProductDetail}
          />
          <MarqueeReplica />
          <HowItWorksReplica />
          <UploadEstimatorReplica />
          <ReasonsReplica />
          <ReviewsReplica />
          <ClosingCTAReplica />
        </main>

        <FooterReplica />

        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-[#111] dark:bg-white text-white dark:text-[#111] hover:opacity-90 transition-opacity z-50 shadow-lg"
            title="Scroll to top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}

        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemove={removeItem} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />
        <Wishlist isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} onAddToCart={handleAddToCart} />
        <Checkout isOpen={isCheckoutOpen} items={cartItems} onClose={() => setIsCheckoutOpen(false)} onComplete={handleOrderComplete} />
        <OrderHistory isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      </div>
    </ErrorBoundary>
  );
}