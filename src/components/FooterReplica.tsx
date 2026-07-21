export default function FooterReplica() {
  return (
    <footer id="footer" className="bg-[#FCFBF7] dark:bg-[#050205] text-black dark:text-white py-16 transition-colors duration-300 border-t border-black/15 dark:border-transparent">
      <div className="do-container">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] items-center">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-[0.25em] mb-2 font-retro">3D BY SD</h2>
          </div>
          <div className="space-y-4 text-sm">
            <p className="font-semibold tracking-[0.22em] uppercase text-zinc-600 dark:text-zinc-400 font-retro text-xs">CONNECT</p>
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://www.instagram.com/3dbysd.in/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block rounded-full border border-black/20 px-5 py-2.5 text-xs uppercase tracking-[0.18em] hover:bg-black/5 dark:border-[#b995ff]/40 dark:hover:bg-[#b995ff]/10 transition-colors"
              >
                Instagram
              </a>
              <a 
                href="send.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block rounded-full border border-black/20 px-5 py-2.5 text-xs uppercase tracking-[0.18em] hover:bg-black/5 dark:border-[#b995ff]/40 dark:hover:bg-[#b995ff]/10 transition-colors"
              >
                WhatsApp
              </a>
              <span className="inline-block rounded-full border border-black/10 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 cursor-not-allowed">
                Facebook
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
