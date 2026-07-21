import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Sparkles, Truck, Users } from 'lucide-react';

const heroStats = [
  { label: 'Made to order', icon: Sparkles },
  { label: 'Premium quality', icon: ShieldCheck },
  { label: 'Made in India', icon: Truck },
];

const heroBadges = [
  { text: 'Made to order', icon: Sparkles },
  { text: 'Premium quality', icon: ShieldCheck },
  { text: 'Made in India', icon: Truck },
];

const productCards = [
  { title: 'Custom Keychain', image: '/categories/home-decor.jpg', price: '₹199' },
  { title: 'NFC Social Stand', image: '/categories/collectibles.jpg', price: '₹499' },
  { title: 'Name Plate', image: '/categories/tech-accessories.jpg', price: '₹299' },
  { title: 'Pixel Lamp', image: '/categories/collectibles.jpg', price: '₹599' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f8f2ff] dark:bg-[#09080f] pt-24 pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(161,146,255,0.28),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(145,99,255,0.14),transparent_20%)] pointer-events-none" />
      <div className="do-container relative grid gap-12 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 xl:col-span-6 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#d6c0ff] bg-[#f2ebff] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#7d55ff] shadow-sm"
          >
            LEVEL UP YOUR SPACE
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-8 text-5xl sm:text-6xl lg:text-[4.25rem] font-black tracking-[-0.04em] text-[#111] dark:text-white leading-[0.95]"
          >
            Custom Products.
            <span className="block text-[#8f5bff]">Made Just For You.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-xl text-base sm:text-lg text-[#4f4f5a] dark:text-zinc-300 leading-relaxed"
          >
            Personalized accessories, creator essentials, and aesthetic pieces 3D printed with detail.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#catalog"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f4bff] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6f4bff]/20 transition hover:bg-[#5836d9]"
            >
              Explore Shop
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#custom-lab"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#beb5ff] bg-white/90 px-6 py-3 text-sm font-semibold text-[#302a4c] transition hover:border-[#6f4bff] hover:text-[#6f4bff]"
            >
              Customize Now
            </a>
          </motion.div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {heroBadges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-3 rounded-full border border-[#e7defd] bg-white/90 px-4 py-3 shadow-sm">
                <badge.icon className="w-4 h-4 text-[#6f4bff]" />
                <span className="text-sm font-semibold text-[#555] dark:text-zinc-300">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="lg:col-span-5 xl:col-span-6 relative z-10"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#d6c0ff] bg-[#fff7ff] shadow-[0_30px_80px_rgba(111,75,255,0.12)]">
            <img
              src="/banners/shop-prints.jpg"
              alt="3DbySD hero product display"
              className="w-full h-[520px] object-cover sm:h-[560px]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 to-transparent px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {productCards.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-sm">
                    <div className="w-14 h-14 overflow-hidden rounded-2xl bg-[#f5f0ff]">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[#7f6be0]">{item.title}</p>
                      <p className="text-sm font-semibold text-[#111]">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
