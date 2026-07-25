import { useEffect } from 'react';
import { motion } from 'motion/react';

export default function ReviewsReplica() {
  useEffect(() => {
    // Standard Tagembed Script Injection
    const script = document.createElement('script');
    script.src = "https://widget.tagembed.com/embed.min.js";
    script.type = "text/javascript";
    script.async = true;

    // Function to re-initialize if the global object exists
    const triggerInit = () => {
      // @ts-ignore
      if (window.TagAppEmbed && typeof window.TagAppEmbed.init === 'function') {
        // @ts-ignore
        window.TagAppEmbed.init();
      }
    };

    // Append script and trigger init
    document.body.appendChild(script);

    // Set a small interval to ensure it renders if the script was already cached
    const interval = setInterval(triggerInit, 1000);

    return () => {
      clearInterval(interval);
      try {
        document.body.removeChild(script);
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, []);

  return (
    <section id="reviews" className="py-24 px-6 bg-[#FCFBF7] dark:bg-[#050205] text-black dark:text-white transition-colors duration-300 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold uppercase tracking-[0.18em] text-[#925FE2] dark:text-[#b995ff] font-retro mb-4"
        >
          Customer Reviews
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-600 dark:text-[#cfcfcf]"
        >
          Real feedback from our Google business profile.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto min-h-[500px] relative rounded-[2rem] bg-white dark:bg-zinc-900 shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
      >
        {/* Standard Tagembed Widget Code for ID 330909 */}
        <div
          className="tagembed-widget"
          style={{ width: '100%', height: '100%', overflow: 'auto', minHeight: '500px' }}
          data-widget-id="330909"
          data-website="1"
        ></div>

        {/* Loading Background Spinner */}
        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-center p-12">
          <div className="w-10 h-10 border-4 border-zinc-200 border-t-[#925FE2] rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Initialising Reviews Stream...
          </p>
        </div>
      </motion.div>
    </section>
  );
}
