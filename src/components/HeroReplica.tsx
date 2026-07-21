import { motion } from 'motion/react';

const heroTags = ['HOME DÉCOR', 'FUNCTIONAL PARTS', 'PERSONALIZED GIFTS', 'INDUSTRIAL PROTOTYPES'];

export default function HeroReplica() {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#FCFBF7] dark:bg-[#050205] text-black dark:text-white min-h-screen pt-[7.5rem] md:pt-[9rem] lg:pt-[10rem] transition-colors duration-300">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(146,95,226,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,156,230,0.08),transparent_18%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(146,95,226,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(146,95,226,0.14),transparent_22%)] pointer-events-none" />
      
      <div className="do-container relative flex min-h-[90vh] flex-col items-center justify-end py-24">
        <div className="relative z-10 max-w-4xl text-center">
          <p className="do-eyebrow justify-center mb-6 text-zinc-500 dark:text-zinc-400">MADE IN INDIA — PRECISION ADDITIVE MANUFACTURING</p>
          <h1 className="text-[clamp(42px,9.2vw,138px)] leading-[0.95] font-semibold tracking-[-0.03em] text-black dark:text-white">
            Ideas Become<br />
            <em className="text-[#925FE2] font-normal italic">Reality.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-[#c8c4ba]">
            Premium custom 3D printing for home décor, functional parts, personalized gifts and industrial prototypes — designed, printed and finished by hand.
          </p>

          <div className="mx-auto mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#collections"
              className="rounded-full bg-black text-white hover:bg-black/90 dark:bg-[#925FE2] dark:text-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.22em] shadow-[0_18px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_18px_50px_rgba(146,95,226,0.22)] transition hover:opacity-95"
            >
              Explore Collection
            </a>
            <a
              href="#configurator"
              className="rounded-full border border-black/15 bg-black/5 hover:border-black dark:border-white/20 dark:bg-white/5 px-8 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-black dark:text-white transition dark:hover:border-[#925FE2]"
            >
              Start Custom Print
            </a>
            <a
              href="#process"
              className="rounded-full border border-black/15 bg-black/5 hover:border-black dark:border-white/20 dark:bg-white/5 px-8 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-black dark:text-white transition dark:hover:border-[#925FE2]"
            >
              Watch Process
            </a>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {heroTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 dark:text-[#ccc]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
