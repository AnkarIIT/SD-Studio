import React, { useState } from 'react';
import { ShoppingCart, Search, User, Home, ChevronDown, Package, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { useCartStore, useUserStore } from '../utils/store';
import ThemeToggle from './ThemeToggle';

interface HeaderReplicaProps {
  onOpenCart: () => void;
  onOpenOrders?: () => void;
  onOpenAuth?: () => void;
  onOpenWishlist?: () => void;
}

export default function HeaderReplica({ onOpenCart, onOpenOrders, onOpenAuth }: HeaderReplicaProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const cartCount = useCartStore((state) => state.getItemCount());
  const { isAuthenticated, user, logout } = useUserStore();

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (!element) return;

    const offset = 110; // Height of the fixed header
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    const currentScroll = window.scrollY;

    animate(currentScroll, offsetPosition, {
      type: "spring",
      bounce: 0,
      duration: 1,
      onUpdate: (latest) => window.scrollTo(0, latest),
    });

    setIsMobileMenuOpen(false);
  };

  const handleSearchClick = () => {
    const catalogSearch = document.getElementById('catalog-search');
    if (catalogSearch) {
      const offset = 110;
      const targetPos = catalogSearch.getBoundingClientRect().top + window.scrollY - offset;
      animate(window.scrollY, targetPos, {
        type: "spring",
        bounce: 0,
        duration: 1,
        onUpdate: (latest) => window.scrollTo(0, latest),
      });
      window.setTimeout(() => catalogSearch.focus(), 800);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col w-full">
      {/* Top Banner */}
      <div className="w-full bg-[#E6DDF2] text-black border-b border-black py-1.5 px-4 md:px-8 text-[11px] font-semibold tracking-wider flex items-center justify-between">
        <div className="flex items-center gap-1 font-mono">
          <motion.span
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="text-sm"
          >
            ✦
          </motion.span>
          Welcome to 3DbySD
        </div>
        <div className="hidden sm:flex items-center gap-1"></div>
        <div className="flex items-center gap-3 font-mono">
          <span className="cursor-pointer hover:underline flex items-center gap-0.5">
            INR ₹ <ChevronDown className="w-3 h-3" />
          </span>
          <ShoppingCart className="w-3.5 h-3.5 cursor-pointer" onClick={onOpenCart} />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="w-full bg-[#FCFBF7] text-black border-b-2 border-black py-3 px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <a href="/" className="font-retro text-lg md:text-2xl font-black tracking-tight text-black flex items-center gap-0.5">
            3D<span className="text-[#925FE2]">by</span>SD
          </a>
        </motion.div>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[12px] font-bold uppercase tracking-widest">
          {[
            { label: 'Home', href: '#hero', icon: Home },
            { label: 'Shop', href: '#catalog', hasDropdown: true },
            { label: 'Customize', href: '#customize' },
            { label: 'Collections', href: '#collections' },
            { label: 'About Us', href: '#about' },
            { label: 'Contact', href: '#footer' },
          ].map((link, idx) => (
            <motion.a
              key={link.label}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              whileHover={{ y: -2 }}
              className={`flex items-center gap-1 hover:text-purple-600 transition-colors pb-1 ${idx === 0 ? 'border-b-2 border-black' : ''}`}
            >
              {link.icon && <link.icon className="w-3.5 h-3.5" />}
              <span>{link.label}</span>
              {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5" />}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleSearchClick} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
            <Search className="w-5 h-5 text-black" />
          </motion.button>
          
          <div className="relative">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { if (isAuthenticated) setShowUserMenu(!showUserMenu); else onOpenAuth?.(); }} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
              <User className="w-5 h-5 text-black" />
            </motion.button>
            <AnimatePresence>
              {showUserMenu && isAuthenticated && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-xl shadow-xl p-2 z-50">
                  <p className="px-3 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 truncate">{user?.name || user?.email}</p>
                  <button type="button" onClick={() => { setShowUserMenu(false); onOpenOrders?.(); }} className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"><Package className="w-3.5 h-3.5" />Orders</button>
                  <button type="button" onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 text-red-500"><LogOut className="w-3.5 h-3.5" />Sign out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />

          <motion.button
            whileHover={{ translateZ: 10, shadow: "4px 4px 0px rgba(0,0,0,1)" }}
            whileTap={{ scale: 0.98, x: 2, y: 2, shadow: "none" }}
            onClick={onOpenCart}
            className="flex items-center justify-between border-2 border-black bg-[#E6DDF2] hover:bg-[#d5cbe3] text-black px-4 py-1.5 rounded font-retro text-[10px] md:text-xs font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          >
            <motion.span key={cartCount} initial={{ scale: 1.2, color: "#925FE2" }} animate={{ scale: 1, color: "#000000" }}>
              INVENTORY ({cartCount})
            </motion.span>
            <Package className="w-4 h-4 ml-2 fill-amber-700 stroke-amber-950" />
          </motion.button>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1.5 hover:bg-black/5 rounded-full transition-colors">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden w-full bg-[#FCFBF7] text-black border-b-2 border-black flex flex-col py-4 px-6 gap-4 text-xs font-bold uppercase tracking-widest shadow-lg overflow-hidden">
            {[
              { label: 'Home', href: '#hero', icon: Home },
              { label: 'Shop', href: '#catalog' },
              { label: 'Customize', href: '#customize' },
              { label: 'Collections', href: '#collections' },
              { label: 'About Us', href: '#about' },
              { label: 'Contact', href: '#footer' },
            ].map((link) => (
              <motion.a key={link.label} href={link.href} onClick={(e) => scrollToSection(e, link.href)} whileTap={{ x: 4 }} className="flex items-center gap-2 py-1.5 border-b border-black/5 hover:text-purple-600 transition-colors">
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
