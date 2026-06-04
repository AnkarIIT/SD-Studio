import { COLLECTIONS } from '../shopContent';
import { useFilterStore } from '../utils/store';

export default function CollectionsGrid() {
  const setCollectionFilter = useFilterStore((s) => s.setCollectionFilter);

  const openCollection = (title: string) => {
    setCollectionFilter(title);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="py-12 md:py-16 do-section-alt">
      <div className="do-container">
        <div className="do-section-header">
          <h2 className="do-section-title">Shop by collection</h2>
          <a href="#catalog" className="do-link">
            View all
          </a>
        </div>
        <div className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => openCollection(col.title)}
              className="group flex-shrink-0 w-[42vw] sm:w-[280px] md:w-[320px] snap-start text-left"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#f5f5f5] dark:bg-zinc-800 mb-3">
                <img
                  src={col.image}
                  alt={col.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-sm font-semibold text-[#111] dark:text-white">{col.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}