import { type FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { validateForm, newsletterSchema } from '../utils/validation';

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-12 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden transition-colors"
        >
          <div className="absolute top-1/2 -right-12 -translate-y-1/2 text-[10rem] font-serif font-black italic text-zinc-100/50 dark:text-zinc-800/30 pointer-events-none select-none">
            15% OFF
          </div>
          <div className="z-10">
            <h2 className="text-3xl font-serif font-black italic mb-2 tracking-tight text-zinc-900 dark:text-zinc-100">
              Join Our Lab Community
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-wide uppercase text-xs">
              Subscribe for 15% off your first order + exclusive updates
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 z-10 flex-col md:flex-row w-full md:w-auto">
            <div className="flex-1 md:w-80">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-widest focus:outline-none focus:bg-white dark:focus:bg-zinc-700 focus:ring-1 ${
                  errors.email ? 'ring-1 ring-red-500' : 'focus:ring-primary'
                } transition-all rounded`}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] hvr-sweep-to-right hover:opacity-90 disabled:opacity-50 transition-opacity rounded"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
