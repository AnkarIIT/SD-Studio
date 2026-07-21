const MARQUEE_TEXT = '✨ NEED SOMETHING PRINTED? ✨ CUSTOM 3D PRINTING AVAILABLE ✨ PAN INDIA DELIVERY ✨ 3D BY SD ✨';

export default function MarqueeReplica() {
  return (
    <div className="marquee bg-[#E6DDF2] dark:bg-[#000000] text-black dark:text-[#b995ff] border-t border-b border-black dark:border-[#5f4b1f] transition-colors duration-300">
      <div className="marquee-track flex gap-16 whitespace-nowrap">
        {Array.from({ length: 8 }).map((_, index) => (
          <span 
            key={index} 
            className={`whitespace-nowrap uppercase tracking-[0.2em] text-[11px] font-semibold ${
              index % 2 === 0 ? 'text-[#925FE2] dark:text-[#b995ff]' : 'text-black dark:text-white'
            }`}
          >
            {MARQUEE_TEXT}
          </span>
        ))}
      </div>
    </div>
  );
}
