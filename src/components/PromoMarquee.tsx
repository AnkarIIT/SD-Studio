import { useSiteSettings } from '../utils/siteSettings';

export default function PromoMarquee() {
  const text = useSiteSettings((s) => s.promoBarText);

  return (
    <div className="do-promo-marquee border-b border-[#e8e8e8] dark:border-zinc-800 bg-[#f7f7f7] dark:bg-zinc-900 overflow-hidden">
      <div className="do-marquee-track">
        <span>{text}</span>
        <span aria-hidden>{text}</span>
        <span aria-hidden>{text}</span>
      </div>
    </div>
  );
}