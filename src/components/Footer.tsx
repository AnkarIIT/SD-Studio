import { Link, useNavigate } from 'react-router';
import { Instagram } from 'lucide-react';
import {
  BRAND_NAME,
  BRAND_INSTAGRAM_URL,
  BRAND_INSTAGRAM_HANDLE,
} from '../brand';

interface FooterProps {
  onTrackOrder?: () => void;
}

export default function Footer({ onTrackOrder }: FooterProps) {
  const navigate = useNavigate();

  const goCategory = (filter: string) => {
    navigate(`/?category=${encodeURIComponent(filter)}`);
  };

  const trackOrder = () => {
    if (onTrackOrder) onTrackOrder();
    else navigate('/?track=orders');
  };

  return (
    <footer className="bg-[#100724] border-t border-[#4b2d98]">
      <div className="do-container py-16 md:py-20 text-[#e5d6ff]">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 md:gap-12">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link to="/" className="text-lg font-semibold tracking-tight text-[#f8f4ff]">
              {BRAND_NAME}
            </Link>
            <p className="mt-4 text-sm text-[#b9a4ff] leading-relaxed max-w-xs">
              Premium 3D printed objects — décor, collectibles & custom lab prints. Made to order in India.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href={BRAND_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#c6b4ff] hover:text-white transition-colors"
                aria-label={`Follow ${BRAND_NAME} on Instagram`}
              >
                <Instagram className="w-5 h-5" />
                <span>{BRAND_INSTAGRAM_HANDLE}</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="do-eyebrow mb-4 text-[#c6b4ff]">Shop</h4>
            <ul className="space-y-3 text-sm text-[#b9a4ff]">
              <li>
                <Link to="/#catalog" className="hover:text-[#111] dark:hover:text-white transition-colors">
                  All products
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goCategory('Home Decor')}
                  className="hover:text-[#111] dark:hover:text-white transition-colors text-left"
                >
                  Home decor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goCategory('Tech')}
                  className="hover:text-[#111] dark:hover:text-white transition-colors text-left"
                >
                  Tech accessories
                </button>
              </li>
              <li>
                <Link to="/#custom-lab" className="hover:text-[#111] dark:hover:text-white transition-colors">
                  Custom lab
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="do-eyebrow mb-4 text-[#c6b4ff]">Help</h4>
            <ul className="space-y-3 text-sm text-[#b9a4ff]">
              <li>
                <button
                  type="button"
                  onClick={trackOrder}
                  className="hover:text-[#111] dark:hover:text-white transition-colors text-left"
                >
                  Track order
                </button>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-[#111] dark:hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-[#111] dark:hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#111] dark:hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="do-eyebrow mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-[#6b6b6b] dark:text-zinc-400">
              <li>
                <Link to="/about" className="hover:text-[#111] dark:hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#111] dark:hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#111] dark:hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href={BRAND_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#111] dark:hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-[#e8e8e8] dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#6b6b6b] dark:text-zinc-500">
          <span>© 2026 {BRAND_NAME}. All rights reserved.</span>
          <span>Prices in ₹ · GST included</span>
        </div>
      </div>
    </footer>
  );
}
