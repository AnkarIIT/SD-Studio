import { Link } from 'react-router';

export default function ClosingCTAReplica() {
  return (
    <section className="py-24 bg-[#FCFBF7] dark:bg-[#170a34] text-black dark:text-[#f7ecff] text-center px-6 border-t-2 border-black dark:border-t dark:border-[#4f2f9c] transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-[0.25em] mb-6 font-retro text-black dark:text-white">Ready to Upgrade Your Space?</h2>
        <p className="text-zinc-600 dark:text-[#d7c2ff] text-lg mb-10 max-w-xl mx-auto">Explore our premium collection of 3D printed aesthetics and bring your vision to life.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="?category=all" 
            className="w-full sm:w-auto px-10 py-4 border-2 border-black bg-[#E6DDF2] hover:bg-[#d5cbe3] dark:bg-gradient-to-r dark:from-[#b995ff] dark:to-[#ff9ce6] text-black dark:text-white font-retro text-xs font-bold uppercase tracking-[0.32em] transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[0_18px_40px_rgba(185,149,255,0.24)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
