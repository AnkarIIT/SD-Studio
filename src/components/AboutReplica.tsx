export default function AboutReplica() {
  return (
    <section className="py-20 bg-[#f8f2ff] text-[#22012c]">
      <div className="do-container grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div>
          <p className="do-eyebrow text-[#7e3beb]">About Layerbound</p>
          <h2 className="do-section-title text-[#0f0020]">A new kind of Indian 3D printing studio</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#4b3164]">
            We blend rapid manufacturing with boutique craft, delivering precision prints, high-end finishes, and design support tailored for startups, artists, and engineers.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#d8b7ff] bg-white/80 p-6 shadow-[0_24px_60px_rgba(148,108,238,0.12)]">
              <p className="text-sm font-semibold text-[#5e2ea6]">Made in India</p>
              <p className="mt-2 text-sm text-[#5c3b75]">Local production, lower lead times, and Indian support.</p>
            </div>
            <div className="rounded-3xl border border-[#d8b7ff] bg-white/80 p-6 shadow-[0_24px_60px_rgba(148,108,238,0.12)]">
              <p className="text-sm font-semibold text-[#5e2ea6]">Design guidance</p>
              <p className="mt-2 text-sm text-[#5c3b75]">Expert feedback to help your print succeed on the first attempt.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2.5rem] border border-[#e6dafb] bg-[#fff8ff] p-6 shadow-[0_24px_60px_rgba(176,144,255,0.16)]">
            <p className="text-sm uppercase tracking-[0.3em] text-[#9461ff]">Quality first</p>
            <p className="mt-3 text-lg font-semibold text-[#321d55]">Every model is reviewed by hand, optimized for print, and finished with care.</p>
          </div>
          <div className="rounded-[2.5rem] border border-[#e6dafb] bg-[#fff8ff] p-6 shadow-[0_24px_60px_rgba(176,144,255,0.16)]">
            <p className="text-sm uppercase tracking-[0.3em] text-[#9461ff]">Flexible runs</p>
            <p className="mt-3 text-lg font-semibold text-[#321d55]">From one-off prototypes to small batch production, every order is handled with the same premium process.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
