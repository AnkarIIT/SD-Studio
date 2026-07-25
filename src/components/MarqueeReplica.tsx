import { motion } from 'motion/react';

const MARQUEE_TEXT = '✨ NEED SOMETHING PRINTED? ✨ CUSTOM 3D PRINTING AVAILABLE ✨ PAN INDIA DELIVERY ✨ 3D BY SD ✨';

export default function MarqueeReplica() {
  return (
    <div className="w-full overflow-hidden bg-[#E6DDF2] dark:bg-[#000000] text-black dark:text-[#b995ff] border-t border-b border-black dark:border-[#5f4b1f] transition-colors duration-300 py-4 flex items-center">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: [0, "-50%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ width: "fit-content" }}
      >
        {/* Render the text multiple times and duplicate for seamless looping */}
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className={`px-12 uppercase tracking-[0.25em] text-[11px] font-black ${
              i % 2 === 0 ? 'text-black dark:text-white' : 'text-[#925FE2] dark:text-[#b995ff]'
            }`}
          >
            {MARQUEE_TEXT}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
