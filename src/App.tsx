import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import RequestModel from './pages/RequestModel';
import TrackOrder from './pages/TrackOrder';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CartDrawer from './components/cart/CartDrawer';
import { MessageSquare, X } from 'lucide-react';
import { HelmetProvider } from 'react-helmet-async';
import { motion } from 'motion/react';
import ErrorBoundary from './components/ErrorBoundary';
import ChatAssistant from './components/ui/ChatAssistant';
import { useSettingsStore, subscribeToSettings } from './store/useSettingsStore';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
    const unsubscribe = subscribeToSettings();
    return () => unsubscribe();
  }, []);

  // Handle Escape key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };

    if (isChatOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isChatOpen]);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/shop" element={<><Navbar /><Shop /><Footer /></>} />
          <Route path="/product/:id" element={<><Navbar /><ProductDetails /><Footer /></>} />
          <Route path="/checkout" element={<><Navbar /><Checkout /><Footer /></>} />
          <Route path="/checkout/success" element={<><Navbar /><CheckoutSuccess /><Footer /></>} />
          <Route path="/request" element={<><Navbar /><RequestModel /><Footer /></>} />
          <Route path="/track" element={<><Navbar /><TrackOrder /><Footer /></>} />
          <Route path="/" element={
            <div className="min-h-screen bg-brand-white text-brand-black scroll-smooth overflow-x-hidden flex flex-col">
              <Navbar />
              <div className="flex-1">
                <Home />
              </div>
              <Footer />
              <div className="fixed inset-0 pointer-events-none -z-10 bg-white" />
            </div>
          } />
        </Routes>
      </ErrorBoundary>
      
      {/* Global Chat Assistant Widget */}
      <ChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Global Chat Button */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50"
      >
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label={isChatOpen ? "Close chat assistant" : "Open chat assistant"}
          title={isChatOpen ? "Close chat (Esc)" : "Open chat"}
          className="bg-gray-900 text-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl hover:bg-black hover:scale-110 active:scale-95 transition-all group"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />}
          {!isChatOpen && (
            <span className="absolute right-full mr-4 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-widest whitespace-nowrap pointer-events-none">
              Chat with us
            </span>
          )}
        </button>
      </motion.div>

      <CartDrawer />
    </HelmetProvider>
  );
}
