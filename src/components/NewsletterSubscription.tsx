import { type FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { validateForm, newsletterSchema } from '../utils/validation';
import { subscribeNewsletter } from '../utils/ordersApi';

export default function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validation = validateForm(newsletterSchema, { email });
    if (!validation.success) {
      setErrors(validation.errors);
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await subscribeNewsletter(email);
      if (result.success) {
        toast.success(result.message ?? 'Subscribed! Use NEWSLETTER15 at checkout.');
        setEmail('');
      } else {
        toast.error(result.error ?? 'Failed to subscribe');
      }
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-[#15072f] text-[#f4e9ff] border-t border-[#4f2f9c]">
      <div className="do-container flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60 mb-2">Newsletter</p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Get 15% off your first order</h2>
          <p className="text-sm text-white/70 mt-2">Subscribe and use code NEWSLETTER15 at checkout.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:max-w-md">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-white text-[#111] text-sm outline-none placeholder:text-[#6b6b6b] ${
                errors.email ? 'ring-2 ring-red-400' : ''
              }`}
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>
          <button type="submit" disabled={loading} className="do-btn-primary bg-gradient-to-r from-[#b995ff] to-[#ff9ce6] text-white hover:opacity-95 disabled:opacity-50 whitespace-nowrap">
            {loading ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}