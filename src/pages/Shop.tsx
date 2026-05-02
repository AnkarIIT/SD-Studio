import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Loader2, Sparkles, Filter, Database } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_SHOP_PRODUCTS, SHOP_CATEGORIES } from '../data/shopCatalog';

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const categories = [...SHOP_CATEGORIES];

  const seedProducts = async () => {
    setIsSeeding(true);
    setSeedError(null);

    try {
      for (const prod of DEFAULT_SHOP_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Failed to seed shop', err);
      setSeedError('Could not save catalog. Deploy updated Firestore rules and try again.');
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    console.log("Initializing Shop Listener...");
    const q = query(collection(db, 'products'));
    
    // Fallback if listener never fires (offline / misconfigured). Realtime updates are instant once connected.
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Firestore shop listener slow; showing UI anyway');
        setLoading(false);
      }
    }, 8000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`Received snapshot with ${snapshot.size} products`);
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
      setLoading(false);
      clearTimeout(timeoutId);

      // Empty catalog: auto-upload (Firestore rules must allow product `create`).
      const seedLock = 'sd-shop-seeding';
      if (snapshot.size === 0 && !sessionStorage.getItem(seedLock)) {
        sessionStorage.setItem(seedLock, '1');
        setIsSeeding(true);
        setSeedError(null);
        void (async () => {
          try {
            for (const prod of DEFAULT_SHOP_PRODUCTS) {
              await addDoc(collection(db, 'products'), {
                ...prod,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
            }
          } catch (e) {
            console.error('Auto-seed failed', e);
            setSeedError('Could not save catalog. Deploy updated firestore.rules (product create) or tap “Load catalog”.');
          } finally {
            sessionStorage.removeItem(seedLock);
            setIsSeeding(false);
          }
        })();
      }
    }, (error) => {
      console.error("Firestore Shop Error:", error);
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
      clearTimeout(timeoutId);
    });
    
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.tag?.toLowerCase() === activeCategory.toLowerCase());

  const emptyCategoryOnly = products.length > 0 && filteredProducts.length === 0;

  return (
    <div className="pt-32 px-6 md:px-16 min-h-screen relative overflow-hidden bg-white">
      <Helmet>
        <title>Collection | SD Studios</title>
        <meta name="description" content="Browse our premium 3D printed gear, NFC keychains, anime decor, and more." />
      </Helmet>
      
      {/* Background Playful Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-4">
             <Sparkles size={16} className="text-violet-500" />
             <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.4em]">The Collection</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85] mb-12">
            Engineered <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">for You.</span>
          </h1>

          {/* Categories Filter */}
          <div className="flex flex-wrap items-center gap-3">
             <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 mr-2">
                <Filter size={18} />
             </div>
             {categories.map((cat) => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500
                   ${activeCategory === cat ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
               >
                 {cat}
               </button>
             ))}

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-32">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="text-violet-500 animate-spin" size={48} />
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Loading the Lab...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((prod, i) => (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard title={prod.title} price={prod.price} tag={prod.tag} color={prod.color || "bg-violet-500"} id={prod.id} image={prod.image} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-32 bg-gray-50 rounded-[3rem] border border-gray-100 relative overflow-hidden text-center px-6"
              >
                 <div className="relative z-10 max-w-md">
                   <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                     {isSeeding ? (
                       <Loader2 className="text-violet-500 animate-spin" size={24} />
                     ) : (
                       <Loader2 className="text-violet-500" size={24} />
                     )}
                   </div>
                   <h3 className="text-3xl font-black mb-3 text-gray-900 uppercase tracking-tight">
                     {emptyCategoryOnly ? 'Nothing in this category' : 'The Lab is Quiet'}
                   </h3>
                   <p className="text-gray-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                     {emptyCategoryOnly
                       ? 'Try “All” or another filter — your latest drops might be in a different category.'
                       : 'Our master craftsmen are currently tuning the machines. Check back soon for new gear!'}
                   </p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Shop;
