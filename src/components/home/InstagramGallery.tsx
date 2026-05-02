import { Instagram, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettingsStore } from '../../store/useSettingsStore';

function handleFromInstagramUrl(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\/$/, '');
    const seg = path.split('/').filter(Boolean).pop();
    return seg ? `@${seg}` : '@3dbysd.in';
  } catch {
    return '@3dbysd.in';
  }
}

const InstagramGallery = () => {
  const { settings } = useSettingsStore();
  const igUrl = settings.instagramUrl || 'https://www.instagram.com/3dbysd.in/';
  const handle = handleFromInstagramUrl(igUrl);

  const images = [
    { img: "/assets/products/nfc-keychain.png", id: 1 },
    { img: "/assets/products/anime-decor.png", id: 2 },
    { img: "/assets/products/desk-stand.png", id: 3 },
    { img: "/assets/products/vase.png", id: 4 },
  ];

  return (
    <section className="py-40 relative bg-white">
      {/* Playful Background Blobs - Isolated in hidden container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[30%] right-[-5%] w-[35%] h-[35%] bg-blue-50 rounded-full blur-[100px] opacity-40" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-16 relative z-10 overflow-visible">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
               <Sparkles size={16} className="text-violet-500" />
               <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.4em]">The Community</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.95] py-2">
              Follow <br/> <motion.span 
                initial={{ backgroundPosition: '200% 0' }}
                whileInView={{ backgroundPosition: '0% 0' }}
                className="inline-block text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic font-normal text-7xl md:text-9xl px-2"
              >
                {handle}
              </motion.span>
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {images.map((item, i) => (
            <motion.a 
              key={item.id}
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8, rotate: i % 2 === 0 ? -5 : 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ 
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                default: { duration: 0.8, delay: i * 0.1 }
              }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 3 : -3 }}
              className="aspect-square bg-white rounded-[3rem] overflow-hidden border-4 border-white shadow-xl relative group cursor-pointer"
            >
              {/* Modern Hover Overlay */}
              <div className="absolute inset-0 bg-violet-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 flex items-center justify-center">
                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-violet-600 shadow-2xl scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500">
                    <Instagram size={24} />
                 </div>
              </div>
              <div className="w-full h-full bg-gray-50 flex items-center justify-center transition-transform duration-1000 group-hover:scale-110">
                 <img src={item.img} alt={`Gallery item ${item.id}`} className="w-full h-full object-cover" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;
