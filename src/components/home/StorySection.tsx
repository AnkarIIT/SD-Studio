import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import StatCounter from '../ui/StatCounter';

const StorySection = () => {
  return (
    <section className="py-40 px-6 md:px-16 bg-white relative overflow-hidden">
      {/* Playful Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-50 rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
        
        {/* Story Visual */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative group"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] border-8 border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
            <img 
              src="/assets/genesis.png" 
              alt="Genesis" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-violet-900/40 to-transparent" />
          </div>
          
          {/* Playful floating label */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 bg-white border border-gray-100 rounded-3xl shadow-2xl p-8 z-20 min-w-[140px]"
          >
             <span className="text-violet-400 font-black text-[10px] uppercase tracking-widest block mb-1">Since</span>
             <span className="text-gray-900 font-black text-3xl italic tracking-tighter">2024.</span>
          </motion.div>
        </motion.div>

        {/* Story Content */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
               <Sparkles size={16} className="text-violet-500" />
               <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.4em]">The Genesis</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85]">Crafting <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">Wonder.</span></h2>
            <p className="text-xl text-gray-500 leading-relaxed max-w-lg font-medium">
              What started as a classroom promise has evolved into a world of physical magic. We turn digital dreams into physical reality with <span className="text-violet-600 font-black">pure imagination.</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 border-y border-gray-100 py-12">
             <StatCounter value="500+" label="Magic Moments" />
             <StatCounter value="1.2K" label="Prints Crafted" />
          </div>

          <button className="flex items-center gap-6 group bg-gray-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-violet-600 hover:scale-105 transition-all shadow-xl shadow-gray-100">
            Full Story
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
