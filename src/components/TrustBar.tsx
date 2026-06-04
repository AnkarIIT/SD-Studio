import { Truck, RotateCcw, Sparkles } from 'lucide-react';
import { useSiteSettings } from '../utils/siteSettings';

const ICONS = [Truck, RotateCcw, Sparkles];

export default function TrustBar() {
  const promos = useSiteSettings((s) => s.trustItems);

  return (
    <section className="border-b border-[#e8e8e8] dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="do-container py-5 md:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          {promos.slice(0, 3).map((text, i) => {
            const Icon = ICONS[i] ?? Sparkles;
            return (
              <div key={text} className="flex items-center justify-center sm:justify-start gap-3">
                <Icon className="w-4 h-4 text-[#111] dark:text-zinc-300 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-xs md:text-sm text-[#6b6b6b] dark:text-zinc-400">{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}