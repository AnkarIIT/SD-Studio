import { motion } from 'motion/react';

export default function FooterReplica() {
  const whatsappNumber = "9918719991";
  const emailAddress = "3dbysd.in@gmail.com";

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <footer id="footer" className="bg-[#FCFBF7] dark:bg-[#050205] text-black dark:text-white py-16 transition-colors duration-300 border-t border-black/15 dark:border-transparent scroll-mt-20">
      <div className="do-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="grid gap-10 lg:grid-cols-[1fr_auto] items-center"
        >
          <div>
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold uppercase tracking-[0.25em] mb-1 font-retro"
            >
              3D BY SD
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
            >
              Lucknow, Uttar Pradesh
            </motion.p>
          </div>

          <div className="space-y-4 text-sm">
            <motion.p
              variants={itemVariants}
              className="font-semibold tracking-[0.22em] uppercase text-zinc-600 dark:text-zinc-400 font-retro text-xs"
            >
              CONNECT
            </motion.p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Instagram', href: 'https://www.instagram.com/3dbysd.in/', target: '_blank', color: 'hover:bg-purple-500/10 border-purple-500/30' },
                { label: 'WhatsApp', href: `https://wa.me/91${whatsappNumber}`, target: '_blank', color: 'hover:bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' },
                { label: 'Email', href: `mailto:${emailAddress}`, target: '_self', color: 'hover:bg-blue-500/10 border-blue-500/30' }
              ].map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.target}
                  rel={link.target === '_blank' ? "noopener noreferrer" : ""}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-block rounded-full border border-black/20 px-6 py-2.5 text-xs uppercase tracking-[0.18em] transition-all ${link.color} dark:border-[#b995ff]/40`}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.span
                variants={itemVariants}
                className="inline-block rounded-full border border-black/10 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
              >
                Facebook
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
