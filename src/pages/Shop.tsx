import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Loader2, Sparkles, Filter, Database } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import { motion, AnimatePresence } from 'motion/react';

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSeeding, setIsSeeding] = useState(false);

  const categories = ['All', 'Keychains', 'Anime', 'Home Lab', 'Tech Gear'];

  const seedProducts = async () => {
    setIsSeeding(true);
    const initialProducts = [
      { title: "Stealth NFC Keychain", price: "599", tag: "Tech Gear", image: "https://images.unsplash.com/photo-1582142839930-2233e73899d4?q=80&w=800&auto=format&fit=crop", color: "bg-gray-900" },
      { title: "Anime Showcase Stand", price: "899", tag: "Anime", image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=800&auto=format&fit=crop", color: "bg-rose-500" },
      { title: "Articulated Magic Dragon", price: "1499", tag: "Anime", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop", color: "bg-violet-500" },
      { title: "Geometric Voronoi Vase", price: "2199", tag: "Home Lab", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=800&auto=format&fit=crop", color: "bg-pink-500" },
      { title: "Cyberpunk Phone Stand", price: "799", tag: "Tech Gear", image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=800&auto=format&fit=crop", color: "bg-indigo-500" },
      { title: "Neon Cable Organizer", price: "449", tag: "Keychains", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=800&auto=format&fit=crop", color: "bg-orange-500" },
      { title: "Minimalist Desk Lamp", price: "3499", tag: "Home Lab", image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=800&auto=format&fit=crop", color: "bg-cyan-500" },
      { title: "Low-Poly Planter Trio", price: "1299", tag: "Home Lab", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop", color: "bg-teal-500" }
    ];

    try {
      for (const prod of initialProducts) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Failed to seed shop", err);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.tag?.toLowerCase() === activeCategory.toLowerCase());

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

             {products.length === 0 && !loading && (
               <button
                 onClick={seedProducts}
                 disabled={isSeeding}
                 className="ml-auto flex items-center gap-2 px-6 py-3 bg-violet-50 text-violet-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-100 transition-all border border-violet-100"
               >
                 {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                 {isSeeding ? "Stocking Lab..." : "Stock the Lab"}
               </button>
             )}
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
                className="col-span-full flex flex-col items-center justify-center py-32 bg-gray-50 rounded-[3rem] border border-gray-100 relative overflow-hidden text-center"
              >
                 <div className="relative z-10">
                   <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                     <Loader2 className="text-violet-500" size={24} />
                   </div>
                   <h3 className="text-3xl font-black mb-3 text-gray-900 uppercase tracking-tight">Printing Soon</h3>
                   <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                     This category is currently in the manufacturing phase. <br/> Check back shortly for the drop.
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
