import { motion } from 'motion/react';
import { ArrowRight, Layers, Cpu, Zap, Star } from 'lucide-react';

const materials = ['PLA', 'ABS', 'PETG', 'TPU', 'Resin', 'CF-ASA', 'Silk PLA', 'Wood Fill'];

const stats = [
  { value: '0.1mm', label: 'Layer Precision' },
  { value: '12+', label: 'Materials' },
  { value: '500+', label: 'Orders Shipped' },
  { value: '4.8★', label: 'Avg. Rating' },
];

const features = [
  { icon: Layers, label: 'FDM & Resin Printing' },
  { icon: Cpu, label: 'Parametric Design' },
  { icon: Zap, label: '1–7 Day Dispatch' },
  { icon: Star, label: 'Custom Lab Available' },
];

const floatingProducts = [
  { seed: 'lamp3d', label: 'Voronoi Lamp', material: 'Recycled PLA', price: '₹7,499', delay: 0, href: '#catalog' },
  { seed: 'dragon3d', label: 'Void Drake', material: 'Silk PLA', price: '₹2,899', delay: 0.15, href: '#catalog' },
  { seed: 'keyboard3d', label: 'Cyberdeck', material: 'CF-ASA', price: '₹9,999', delay: 0.3, href: '#catalog' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950 pt-36 pb-0">
      {/* Animated background grid */}
      <div className="absolute inset-0 hero-grid-bg opacity-[0.035] dark:opacity-[0.06] pointer-events-none" />

      {/* Top bar — material ticker */}
      <div className="border-y border-zinc-100 dark:border-zinc-800 overflow-hidden py-3 mb-16">
        <motion.div
          className="flex gap-10 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {[...materials, ...materials].map((m, i) => (
            <span key={i} className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">
              ◆ {m}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Main headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          <div className="lg:col-span-7 xl:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 border border-primary/30 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-full mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">
                Next-Gen 3D Fabrication · India
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-zinc-900 dark:text-zinc-100 mb-6"
            >
              Shop 3D printed
              <span className="text-primary block">objects you can actually use</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mb-8"
            >
              Lamps, desk accessories, collectibles & tech parts — made to order in India,
              shipped to your door. Prices in ₹, GST included.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#catalog"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all rounded-lg shadow-md shadow-primary/20 btn-glow"
              >
                Browse all products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#custom-lab"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:border-primary hover:text-primary transition-all rounded-lg bg-white/80 dark:bg-zinc-900/80"
              >
                Custom print request
              </a>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-3 mt-10"
            >
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-3 py-2 rounded-lg">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Floating product cards */}
          <div className="lg:col-span-5 xl:col-span-6 relative hidden lg:flex flex-col gap-5 pt-4">
            {floatingProducts.map((p, i) => (
              <motion.a
                href={p.href}
                key={p.seed}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + p.delay, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className={`flex items-center gap-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-xl shadow-zinc-100 dark:shadow-zinc-950 cursor-pointer hover:border-primary/40 transition-colors ${i === 1 ? 'ml-12' : i === 2 ? 'ml-6' : ''}`}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 flex-shrink-0">
                  <img
                    src={`https://picsum.photos/seed/${p.seed}/200/200`}
                    alt={p.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase tracking-widest text-[10px] text-zinc-900 dark:text-zinc-100 truncate">{p.label}</p>
                  <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">{p.material}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-serif font-black italic text-primary">{p.price}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">⚡ MTO</span>
                  </div>
                </div>
              </motion.a>
            ))}

            {/* Promo card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="ml-4 flex items-center gap-4 bg-primary text-white rounded-2xl p-5"
            >
              <div className="text-5xl font-serif font-black italic leading-none">10%</div>
              <div>
                <p className="font-black uppercase tracking-widest text-[10px] mb-0.5">First Order Discount</p>
                <p className="text-[9px] font-bold tracking-widest opacity-70 uppercase">Code: SD3D_FIRST_10</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 border-t border-zinc-100 dark:border-zinc-800"
        >
          {stats.map((s, i) => (
            <div key={s.label} className={`py-8 px-6 text-center ${i < 3 ? 'border-r border-zinc-100 dark:border-zinc-800' : ''}`}>
              <div className="text-3xl md:text-4xl font-serif font-black italic text-zinc-900 dark:text-zinc-100 mb-1">{s.value}</div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
