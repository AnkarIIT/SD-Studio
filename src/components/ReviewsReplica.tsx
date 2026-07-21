import { Star } from 'lucide-react';

const REVIEWS = [
  {
    text: 'Excellent print quality and premium finish. The product looked even better in person.',
    author: 'Verified Customer',
  },
  {
    text: 'Fast delivery and great communication throughout the order process.',
    author: 'Verified Customer',
  },
  {
    text: 'Exactly what I wanted. Custom order was printed perfectly.',
    author: 'Verified Customer',
  },
];

export default function ReviewsReplica() {
  return (
    <section className="py-24 px-6 bg-[#FCFBF7] dark:bg-[#050205] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold uppercase tracking-[0.18em] text-[#925FE2] dark:text-[#b995ff] font-retro mb-4">Customer Reviews</h2>
        <p className="text-zinc-600 dark:text-[#cfcfcf]">Trusted by customers across India.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {REVIEWS.map((review, idx) => (
          <div key={idx} className="rounded-[28px] border-2 border-black dark:border-[#b995ff40] bg-[#FCFBF7] dark:bg-[#0b0b0b]/90 p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="mb-4 text-[#925FE2] dark:text-[#b995ff]">★★★★★</div>
            <p className="text-sm leading-7 text-zinc-600 dark:text-[#e5e0d1] mb-6">{review.text}</p>
            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-[#cfcfcf]">— {review.author}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
