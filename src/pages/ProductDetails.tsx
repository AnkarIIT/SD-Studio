import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Box, Droplets, Zap, ShieldCheck, Truck, Info, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import ProductPreview3D from '../components/product/ProductPreview3D';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState('PLA');
  const [color, setColor] = useState('Matte Black');
  const [quality, setQuality] = useState('Standard');
  const [expandedSection, setExpandedSection] = useState<string | null>('details');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: `${product.id}-${material}-${color}-${quality}`,
      title: `${product.title}`,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-violet-600" strokeWidth={2.5} size={48} />
    </div>
  );

  return (
    <div className="pt-32 pb-40 px-6 md:px-16 min-h-screen relative overflow-hidden bg-white">
      <Helmet>
        <title>{product?.title || 'Product'} | SD Studios</title>
      </Helmet>
      
      {/* Background Playful Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <button 
          onClick={() => navigate('/shop')}
          className="group flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors mb-12 uppercase font-black text-[10px] tracking-widest"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </button>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 lg:gap-24 items-start">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="aspect-square bg-gray-50 rounded-[3.5rem] flex items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden group"
            >
              <img 
                src={product?.image || "/assets/placeholder.png"} 
                alt={product?.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                 <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-500" />
                    <span className="text-gray-900 font-black text-[10px] uppercase tracking-widest">{product?.tag || 'Limited'}</span>
                 </div>
              </div>
            </motion.div>
            <ProductPreview3D />
          </div>

          {/* Product Actions */}
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none mb-6">
                {product?.title?.split(' ')[0]} <br/> 
                <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic font-normal">
                  {product?.title?.split(' ').slice(1).join(' ')}
                </span>
              </h1>
              <p className="text-3xl font-black tracking-tighter text-gray-900">₹{product?.price}</p>
            </div>
            
            <div className="space-y-10">
              {/* Material Lab */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="uppercase tracking-[0.3em] text-[10px] font-black text-gray-400">1. Select Material</span>
                  <span className="text-violet-600 text-[10px] font-black uppercase tracking-widest">{material}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'PLA', icon: Box, label: 'PLA' },
                    { id: 'PETG', icon: ShieldCheck, label: 'PETG' },
                  ].map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => setMaterial(opt.id)}
                      className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-500
                        ${material === opt.id ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                      <opt.icon size={14} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Hub */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="uppercase tracking-[0.3em] text-[10px] font-black text-gray-400">2. Printing Resolution</span>
                  <span className="text-violet-600 text-[10px] font-black uppercase tracking-widest">{quality}</span>
                </div>
                <div className="flex gap-3">
                  {[
                    { id: 'Standard', label: 'Standard (0.2mm)', icon: Zap },
                    { id: 'Ultra', label: 'Ultra High (0.1mm)', icon: Sparkles }
                  ].map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => setQuality(opt.id)}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-500
                        ${quality === opt.id ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                      <opt.icon size={14} />
                      {opt.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-6">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full bg-gray-900 text-white font-black py-7 rounded-3xl flex items-center justify-center gap-4 hover:bg-violet-600 shadow-2xl shadow-gray-100 transition-all uppercase tracking-[0.3em] text-xs group"
              >
                <ShoppingBag size={18} className="group-hover:rotate-12 transition-transform" />
                Add to Magic Cart
              </motion.button>
              
              <div className="flex items-center justify-center gap-6">
                 <div className="flex items-center gap-2">
                    <Truck size={14} className="text-violet-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Pan India Shipping</span>
                 </div>
                 <div className="w-1 h-1 bg-gray-200 rounded-full" />
                 <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-violet-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Quality Assured</span>
                 </div>
              </div>
            </div>

            {/* Technical Accordions */}
            <div className="pt-8 border-t border-gray-50 space-y-2">
              {[
                { id: 'details', title: 'Tech Specs', icon: Info, content: 'Engineered with precision. This product is manufactured using industrial-grade FDM and SLA techniques, ensuring maximum durability and visual fidelity.' },
                { id: 'shipping', title: 'The Lab Process', icon: Truck, content: 'Each order is custom printed. Manufacturing takes 3-5 business days, followed by 2-4 days for shipping across India.' },
              ].map((section) => (
                <div key={section.id} className="group">
                  <button 
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="w-full flex items-center justify-between py-6 text-left"
                  >
                    <div className="flex items-center gap-3">
                       <section.icon size={16} className={expandedSection === section.id ? 'text-violet-600' : 'text-gray-300'} />
                       <span className={`uppercase tracking-widest text-[11px] font-black transition-colors ${expandedSection === section.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'}`}>
                        {section.title}
                       </span>
                    </div>
                    {expandedSection === section.id ? <ChevronUp size={16} className="text-violet-600" /> : <ChevronDown size={16} className="text-gray-300 group-hover:text-gray-900" />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-8 text-gray-500 font-medium leading-relaxed text-xs pr-12">
                          {section.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
