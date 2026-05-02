import { Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const ReviewCard = ({ name, city, text, color }: { name: string, city: string, text: string, color: string }) => (
  <motion.div 
    whileHover={{ y: -10, scale: 1.05 }}
    className="flex-shrink-0 w-[220px] bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.02)] mx-2 group hover:shadow-xl transition-all duration-500"
  >
    <div className="flex gap-1 mb-3 text-violet-500">
      {[...Array(5)].map((_, i) => <Star key={i} size={8} fill="currentColor" />)}
    </div>
    <p className="text-gray-500 text-[10px] mb-4 leading-relaxed font-medium line-clamp-2 italic">"{text}"</p>
    <div className="flex items-center gap-2.5 pt-3 border-t border-gray-50">
      <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center text-white font-black text-[8px] shadow-sm`}>
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <h4 className="font-black text-gray-900 tracking-tight text-[9px] uppercase leading-none mb-1">{name}</h4>
        <p className="text-[7px] text-gray-300 uppercase tracking-widest font-bold leading-none">{city}</p>
      </div>
    </div>
  </motion.div>
);

const Reviews = () => {
  const allReviews = [
    // ... same reviews
  ];

  const row1 = allReviews.slice(0, 11);
  const row2 = allReviews.slice(11, 21);

  return (
    <section id="reviews" className="py-40 relative overflow-hidden bg-white">
      {/* Background Playful Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[120px] opacity-40 animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-[1400px] mx-auto px-6 md:px-16 mb-16 relative z-10 text-center"
      >
        <div className="flex flex-col items-center gap-4 mb-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-100 rounded-full">
              <Sparkles size={14} className="text-violet-500" />
              <span className="text-violet-600 font-black text-[10px] uppercase tracking-widest text-center">Social Proof</span>
           </div>
        </div>
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85]">
          Trusted by <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">the Community.</span>
        </h2>
      </motion.div>

      <div className="space-y-4 relative z-10">
        {/* Row 1: Left to Right */}
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex overflow-hidden"
        >
          <motion.div 
            animate={{ x: [0, -2464] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex"
          >
            {[...row1, ...row1].map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))}
          </motion.div>
        </motion.div>

        {/* Row 2: Right to Left */}
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex overflow-hidden"
        >
          <motion.div 
            animate={{ x: [-2240, 0] }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="flex"
          >
            {[...row2, ...row2].map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;
