import { motion, useMotionValue, useSpring, useTransform, Variants } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import StatCounter from '../ui/StatCounter';

const Hero = () => {
  const { settings } = useSettingsStore();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const rotateX = useTransform(springY, [-300, 300], [10, -10]);
  const rotateY = useTransform(springX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const titleVariants: Variants = {
    hidden: { y: 100, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }
    })
  };

  return (
    <section 
      id="home" 
      onMouseMove={handleMouseMove}
      className="relative min-h-[95vh] flex items-center justify-center bg-white pt-32 px-6 md:px-16 overflow-hidden"
    >
      {/* Playful Floating Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-violet-100 rounded-full blur-[120px] opacity-60" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 100, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[0%] right-[-5%] w-[45%] h-[45%] bg-pink-50 rounded-full blur-[100px] opacity-70" 
        />
        <motion.div 
          animate={{ 
            x: [0, 50, 0], 
            y: [0, -50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[80px] opacity-40" 
        />
      </div>

      <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-12 relative z-10 overflow-visible">
        <div className="space-y-12 overflow-visible">
          <div className="space-y-8 overflow-visible">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-100 rounded-full">
               <Sparkles size={14} className="text-violet-500" />
               <span className="text-violet-600 font-bold text-[10px] uppercase tracking-widest">Digital Dreams → Physical Reality</span>
            </div>
            <div className="space-y-4 overflow-visible">
              <div className="overflow-visible py-4">
                <motion.h1 
                  key={settings.heroTitle}
                  custom={0} initial="hidden" animate="visible" variants={titleVariants}
                  className="text-[11vw] lg:text-9xl font-black leading-[1.12] text-gray-900 tracking-tighter pb-2 whitespace-normal break-words hyphens-auto"
                >
                  {settings.heroTitle.split(' ').map((word, i) => (
                    <span key={i} className="inline-block">
                      {word === 'Magic' || word === 'Life' ? (
                        <span className="inline-block text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic pr-12">{word}</span>
                      ) : word + '\u00A0'}
                    </span>
                  ))}
                </motion.h1>
              </div>
              <motion.p 
                key={settings.heroSubtitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-lg font-medium"
              >
                {settings.heroSubtitle}
              </motion.p>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4 w-full"
          >
            <Link to="/shop" className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-violet-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200 group">
              Start Exploring
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/request" className="bg-white border border-gray-100 px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:border-violet-300 hover:text-violet-600 transition-all text-gray-900 shadow-sm">
              Custom Quote
            </Link>
          </motion.div>
          
          <div className="pt-12 flex items-center gap-16">
            <motion.div whileHover={{ scale: 1.1, rotate: 2 }} className="cursor-default">
              <StatCounter value="10k+" label="Magic Moments" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1, rotate: -2 }} className="cursor-default">
              <StatCounter value="4.9/5" label="Happy Creators" />
            </motion.div>
          </div>
        </div>

        <motion.div 
          style={{ rotateX, rotateY, perspective: 1000 }}
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:flex justify-end items-center"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 left-0 text-violet-300"
          >
            <Sparkles size={24} />
          </motion.div>
          
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-28 h-28 bg-linear-to-br from-violet-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-2xl z-20 border-4 border-white"
          >
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">New</p>
              <p className="text-lg font-black uppercase tracking-widest leading-none">Drop</p>
            </div>
          </motion.div>

          <div className="relative group p-12">
             <motion.div
               animate={{ y: [0, -30, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             >
               <img 
                 src="/assets/dragon-real.jpg" 
                 alt="Real 3D Printed Dragon" 
                 className="w-full h-auto drop-shadow-[0_50px_50px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_80px_80px_rgba(0,0,0,0.15)] transition-all duration-700 hover:scale-110 mix-blend-multiply brightness-[1.02] contrast-[1.05]"
               />
             </motion.div>
          </div>
          
          <motion.div 
            style={{ 
              x: useTransform(springX, [-300, 300], [-30, 30]), 
              y: useTransform(springY, [-300, 300], [-30, 30]) 
            }}
            className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-[2.5rem] shadow-2xl p-10 flex flex-col justify-end min-w-[240px] z-30"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[2px] bg-violet-500" />
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-[0.3em]">Collection 01</p>
            </div>
            <p className="text-3xl font-black text-gray-900 leading-none mb-4">Crystal <span className="text-violet-500">Dragon.</span></p>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-violet-100 border border-violet-200" />)}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
