import { CATEGORY_TILES } from '../shopContent';
import { useFilterStore } from '../utils/store';

export default function CategoryTiles() {
  const setCategory = useFilterStore((s) => s.setCategory);

  const handleClick = (filter: string | null) => {
    if (filter) {
      setCategory(filter);
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-zinc-950">
      <div className="do-container">
        <div className="do-section-header">
          <h2 className="do-section-title">Shop by category</h2>
          <a href="#catalog" className="do-link">
            View all
          </a>
        </div>

        <div className="flex gap-5 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-3 -mx-4 px-4 md:mx-0 md:px-0">
          {CATEGORY_TILES.map((tile) => (
            <a
              key={tile.id}
              href={tile.href}
              onClick={(e) => {
                if (tile.filter) {
                  e.preventDefault();
                  handleClick(tile.filter);
                }
              }}
              className="group flex-shrink-0 w-[44vw] sm:w-[220px] md:w-[260px] lg:w-[280px] snap-start text-center"
            >
              <div className="aspect-square overflow-hidden bg-[#f0f0f0] dark:bg-zinc-800 mb-4">
                <img
                  src={tile.image}
                  alt={tile.imageAlt ?? tile.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-[#111] dark:text-white tracking-wide">
                {tile.title}
              </h3>
              <p className="text-xs text-[#6b6b6b] dark:text-zinc-400 mt-1">{tile.subtitle}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}