import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CONTENT_PAGES, type ContentSlug } from '../contentPages';
import ThemeToggle from '../components/ThemeToggle';
import PromoMarquee from '../components/PromoMarquee';
import Footer from '../components/Footer';
import { BRAND_NAME } from '../brand';

export default function ContentPage({ slug }: { slug: ContentSlug }) {
  const page = CONTENT_PAGES[slug];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-[#111] dark:text-zinc-100">
      <PromoMarquee />
      <header className="border-b border-[#e8e8e8] dark:border-zinc-800 sticky top-0 z-40 bg-white dark:bg-zinc-950">
        <div className="do-container h-14 flex items-center justify-between">
          <Link
            to="/"
            className="text-[17px] font-semibold tracking-[0.12em] uppercase hover:opacity-70 transition-opacity"
          >
            {BRAND_NAME}
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/" className="do-link inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Shop
            </Link>
          </div>
        </div>
      </header>

      <main className="do-container py-12 md:py-16 max-w-3xl flex-grow">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight uppercase">{page.title}</h1>
        <p className="text-[#6b6b6b] dark:text-zinc-400 mt-2 mb-10">{page.subtitle}</p>

        <div className="space-y-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold mb-3">{section.heading}</h2>
              <p className="text-[#6b6b6b] dark:text-zinc-400 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}