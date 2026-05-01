import ContactForm from '../ui/ContactForm';

const Footer = () => {
  return (
    <footer className="z-20 bg-white relative overflow-hidden">
      {/* Playful Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-blue-50 rounded-full blur-[100px] opacity-40" />
      </div>

      <section className="py-40 px-6 md:px-16 border-t border-gray-50 relative z-10">
         <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-16 md:gap-12 text-center md:text-left">
            <div className="flex-1">
              <h2 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 text-gray-900 leading-[0.85]">
                Ready <br/>to <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic font-normal">Start?</span>
              </h2>
              <p className="text-gray-500 text-lg max-w-sm tracking-wide leading-relaxed mb-12 font-medium">Join our community for limited drops <br/>and premium tech releases.</p>
              
              <div className="flex gap-10 text-[11px] font-black uppercase tracking-[0.3em] justify-center md:justify-start">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-all hover:scale-110">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-pink-500 transition-all hover:scale-110">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-green-500 transition-all hover:scale-110">WhatsApp</a>
              </div>
            </div>
            <div className="flex-1 w-full flex justify-center md:justify-end">
               <ContactForm />
            </div>
         </div>
      </section>
      
      <div className="h-24 w-full flex items-center justify-between px-6 md:px-16 border-t border-gray-50 text-[10px] text-gray-400 uppercase tracking-widest font-black relative z-10">
        <div className="hidden sm:flex items-center gap-2">
           <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
           Pan India Shipping
        </div>
        <div className="hidden md:block">Engineered with magic by SD Studios</div>
        <div className="text-gray-900">SD STUDIOS © 2024</div>
      </div>
    </footer>
  );
};

export default Footer;
