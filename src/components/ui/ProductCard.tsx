import { motion } from 'motion/react';
import { Package, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ title, price, tag, color, id, image }: { title: string, price: string, tag: string, color: string, id?: string, image?: string }) => {
  const getTagColor = (t: string) => {
    const lower = t.toLowerCase();
    if (lower.includes('featured')) return 'bg-violet-500';
    if (lower.includes('new')) return 'bg-pink-500';
    if (lower.includes('gift')) return 'bg-blue-500';
    return 'bg-gray-900';
  };

  return (
    <motion.div 
      whileHover={{ y: -15, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="bg-white p-6 flex flex-col h-full group rounded-[2.5rem] border border-gray-100 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(139,92,246,0.15)]"
    >
      <div className="relative aspect-square rounded-[2rem] mb-6 overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-50">
        {/* Playful Tag */}
        <div className="absolute top-5 left-5 z-20">
          <span className={`text-[9px] text-white font-black uppercase tracking-[0.2em] ${getTagColor(tag)} px-4 py-2 shadow-lg rounded-full`}>
            {tag}
          </span>
        </div>

        {/* Bouncy Action Button */}
        <div className="absolute top-5 right-5 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
           <button className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all shadow-xl">
             <Plus size={18} />
           </button>
        </div>

        <div className="w-full h-full transition-all duration-1000 group-hover:scale-110 flex items-center justify-center">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Package className="text-gray-200" size={64} />
            )}
        </div>
      </div>

      <div className="px-2 mt-auto flex flex-col gap-4">
        <div>
          <p className="text-[9px] text-violet-400 mb-1.5 uppercase font-black tracking-[0.3em]">Magic Object</p>
          <h3 className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-violet-600 transition-colors">{title}</h3>
        </div>
        
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Price</span>
            <p className="text-gray-900 font-black text-xl italic">₹{price}</p>
          </div>
          
          <Link to={`/product/${id || 'default'}`} className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-gray-900 group/link">
            <span className="relative">
              Explore
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-violet-200 scale-x-0 group-hover/link:scale-x-100 origin-left transition-transform duration-300" />
            </span>
            <div className="w-9 h-9 rounded-2xl border border-gray-100 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all duration-300">
              <ChevronRight size={14} />
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
