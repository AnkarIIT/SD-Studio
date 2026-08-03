import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { Product } from '../types';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface ProductGalleryProps {
  product: Product;
  discount?: number;
  showThumbnails?: boolean;
  mediaClassName?: string;
  thumbnailsClassName?: string;
}

export default function ProductGallery({
  product,
  discount = 0,
  showThumbnails = true,
  mediaClassName = 'aspect-square',
  thumbnailsClassName = '',
}: ProductGalleryProps) {
  const media = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = [];
    const images = product.images?.length ? product.images : [product.image];
    for (const url of images) {
      if (typeof url === 'string' && url.trim()) items.push({ type: 'image', url });
    }
    if (product.videoUrl?.trim()) items.push({ type: 'video', url: product.videoUrl.trim() });
    return items;
  }, [product.image, product.images, product.videoUrl]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [product.id]);

  const current = media[Math.min(active, Math.max(media.length - 1, 0))] ?? media[0];
  const goTo = (index: number) => {
    if (!media.length) return;
    setActive((index + media.length) % media.length);
  };

  if (!media.length) return null;

  return (
    <div className="flex flex-col">
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-[#f5f5f5] dark:bg-zinc-800 group ${mediaClassName}`}
      >
        {current.type === 'video' ? (
          <video
            key={current.url}
            src={current.url}
            className="w-full h-full object-contain bg-black/60"
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={current.url}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}

        {discount > 0 && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-[#111] text-white px-2 py-1 z-10">
            -{discount}%
          </span>
        )}

        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous media"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 text-[#111] dark:text-white border border-[#e8e8e8] dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#111] hover:text-white dark:hover:bg-white dark:hover:text-[#111]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next media"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 text-[#111] dark:text-white border border-[#e8e8e8] dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#111] hover:text-white dark:hover:bg-white dark:hover:text-[#111]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute bottom-3 left-3 z-10 text-[10px] font-semibold tabular-nums uppercase tracking-wider bg-black/60 text-white px-2 py-1">
              {active + 1} / {media.length}
            </span>
          </>
        )}
      </div>

      {showThumbnails && media.length > 1 && (
        <div className={`flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin ${thumbnailsClassName}`}>
          {media.map((item, i) => (
            <button
              type="button"
              key={`${item.type}-${item.url}`}
              onClick={() => goTo(i)}
              aria-label={`View media ${i + 1}`}
              className={`relative w-16 h-16 flex-shrink-0 overflow-hidden rounded border-2 transition-all ${
                i === active
                  ? 'border-[#111] dark:border-white'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <>
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </span>
                </>
              ) : (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
