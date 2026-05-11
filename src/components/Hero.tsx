import { motion } from 'motion/react';
import { MousePointer2, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-40 pb-20 md:pt-64 md:pb-32 overflow-hidden bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-12 xl:col-span-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-block text-primary font-black uppercase tracking-[0.4em] text-xs mb-6"
            >
              // Next Generation Fabrication
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[14vw] lg:text-[10vw] font-serif font-black leading-[0.8] tracking-tighter italic text-zinc-900 dark:text-zinc-100 mb-12"
            >
              Stylish <br />
              <span className="text-primary drop-shadow-2xl">Objects.</span>
            </motion.h1>

            <div className="flex flex-col items-center gap-12">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="max-w-2xl text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed"
              >
                3D by SD is a premium online store for precision-engineered 3D products.
                We bring high-fidelity digital art into your physical reality.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap justify-center gap-8"
              >
                <a
                  href="#catalog"
                  className="group flex items-center gap-4 text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 border-b-4 border-zinc-900 dark:border-zinc-100 pb-2 hover:text-primary hover:border-primary transition-all pr-4"
                >
                  Shop The Collection
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </a>

                <a
                  href="#custom-lab"
                  className="px-12 py-5 bg-zinc-900 dark:bg-zinc-800 text-white font-black uppercase tracking-[0.2em] text-[10px] hvr-sweep-to-right hover:bg-zinc-950 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center"
                >
                  Custom Orders
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Decorative Text - Stylish inspired */}
      <div className="absolute top-1/2 -right-24 md:right-12 -translate-y-1/2 rotate-90 origin-center pointer-events-none opacity-5">
        <span className="text-[20rem] font-serif font-black italic whitespace-nowrap leading-none">
          FABRICATE
        </span>
      </div>

      {/* 10% OFF Floating Ad - Inspired by Stylish */}
      <div className="absolute bottom-12 left-12 hidden xl:flex items-center gap-6 p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 z-20 transition-colors">
        <div className="text-7xl font-serif font-black italic text-zinc-200 dark:text-zinc-800 transition-colors">10%</div>
        <div>
          <h4 className="font-bold uppercase tracking-widest text-xs mb-1 text-zinc-900 dark:text-zinc-100">Signup Bonus</h4>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-tighter">Use Code: SD3D_FIRST_10</p>
        </div>
      </div>
    </section>
  );
}
