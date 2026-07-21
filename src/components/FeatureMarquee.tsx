import { motion } from 'motion/react';
import { Sparkles, Zap, ShieldCheck, Users } from 'lucide-react';

const FEATURES = [
  { text: 'Custom made just for you', icon: Sparkles },
  { text: 'Secure payments', icon: ShieldCheck },
  { text: 'Fast delivery', icon: Zap },
  { text: 'Join the club', icon: Users },
  { text: 'Custom made just for you', icon: Sparkles },
  { text: 'Secure payments', icon: ShieldCheck },
  { text: 'Fast delivery', icon: Zap },
  { text: 'Join the club', icon: Users },
];

export default function FeatureMarquee() {
  return (
    <section className="py-4 bg-[#111] text-white overflow-hidden border-y border-zinc-800">
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 20,
          }}
          className="flex items-center gap-12 sm:gap-24 px-6 min-w-max"
        >
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase">
                  {feature.text}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
