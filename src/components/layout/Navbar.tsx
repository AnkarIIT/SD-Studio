import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { toggleCart, items } = useCartStore();
  const { settings } = useSettingsStore();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <AnimatePresence>
        {settings.showBanner && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-gray-900 text-white py-3 px-6 text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">{settings.noticeBanner}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <nav className={`fixed left-0 right-0 z-50 h-24 flex items-center justify-between px-6 md:px-16 pointer-events-auto bg-white/80 backdrop-blur-xl transition-all duration-500 ${settings.showBanner ? 'top-10' : 'top-0'}`}>
      <Link 
        to="/" 
        className="flex items-center gap-3 group"
      >
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center transition-all group-hover:rotate-12 group-hover:bg-violet-600 shadow-xl shadow-gray-200">
          <Sparkles size={20} className="text-white" />
        </div>
        <span className="font-heading text-xl font-black tracking-tighter text-gray-900 uppercase">
          SD <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500">Studios.</span>
        </span>
      </Link>
      
      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-[10px] font-black tracking-[0.3em] uppercase text-gray-400">
        <Link to="/" className="hover:text-violet-600 transition-colors relative group">
          Home
          <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Link>
        <Link to="/shop" className="hover:text-violet-600 transition-colors relative group">
          Shop
          <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Link>
        <Link to="/request" className="hover:text-violet-600 transition-colors relative group">
          Request
          <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Link>
        <Link to="/track" className="hover:text-violet-600 transition-colors relative group">
          Track
          <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <button onClick={toggleCart} className="relative group text-gray-800 hover:text-violet-600 transition-all hover:scale-110 active:scale-95">
          <ShoppingBag size={24} />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-lg">
              {cartItemCount}
            </span>
          )}
        </button>
        <Link to="/request" className="bg-gray-900 text-white hidden md:block px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-100">
          CUSTOM ORDER
        </Link>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
