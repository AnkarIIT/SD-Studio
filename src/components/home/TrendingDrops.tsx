import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { ChevronRight, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { motion, useScroll, useTransform } from 'motion/react';

const TrendingDrops = () => {
  const defaultProducts = [
    { id: "nfc-keychain", title: "NFC keychain", price: "499", tag: "Featured", image: "/assets/products/nfc-keychain.png" },
    { id: "anime-decor", title: "Anime decor", price: "899", tag: "New Drop", image: "/assets/products/anime-decor.png" },
    { id: "desk-stands", title: "Desk stands", price: "599", tag: "Gift Idea", image: "/assets/products/desk-stand.png" },
    { id: "vase-01", title: "Minimalist Vase", price: "1299", tag: "Premium", image: "/assets/products/vase.png" },
  ];

  const [products, setProducts] = useState<any[]>(defaultProducts);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      if (prods.length > 0) {
        setProducts(prods);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return () => unsubscribe();
  }, []);

  return (
    <section id="shop" className="py-32 relative overflow-hidden bg-white">
      {/* Playful Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-40" />
        <div className="absolute bottom-[10%] left-[-10%] w-[35%] h-[35%] bg-pink-50 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-16 mb-20 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
               <Sparkles size={16} className="text-violet-500" />
               <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.4em]">Trending Gear</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none">
              Fan <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic font-normal">Favorites.</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-8 pb-4">
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              <span>Swipe to Explore Magic</span>
              <div className="w-16 h-1 bg-gray-100 rounded-full relative overflow-hidden">
                <motion.div 
                  animate={{ x: [-64, 64] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-full h-full bg-violet-500"
                />
              </div>
            </div>
            <button className="group flex items-center gap-4 bg-gray-900 text-white px-8 py-4 rounded-2xl transition-all text-[10px] uppercase tracking-[0.3em] font-black hover:bg-violet-600 hover:scale-105 active:scale-95 shadow-xl">
              View All
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex overflow-x-auto gap-6 px-6 md:px-16 pb-12 no-scrollbar snap-x snap-mandatory"
      >
        {products.map((prod, i) => (
          <motion.div 
            key={prod.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="min-w-[300px] md:min-w-[400px] snap-center"
          >
            <ProductCard id={prod.id} title={prod.title} price={prod.price} tag={prod.tag} color="bg-gray-50" image={prod.image} />
          </motion.div>
        ))}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="min-w-[300px] md:min-w-[400px] snap-center bg-gray-50 p-12 flex flex-col justify-center border border-gray-100 rounded-2xl"
        >
           <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium italic">"A classroom promise. Designed for dreamers."</p>
           <div className="space-y-1">
             <span className="text-[10px] uppercase font-bold tracking-widest text-gray-900 block">Core Mission</span>
             <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Established 2024</span>
           </div>
        </motion.div>
      </div>

      {/* Progress bar indicator */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-16">
        <div className="h-[1px] w-full bg-gray-100 relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gray-900"
            style={{ width: "20%" }} // Simple indicator for now, can be linked to scroll
          />
        </div>
      </div>
    </section>
  );
};

export default TrendingDrops;
