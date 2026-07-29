import { Link, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import HeaderReplica from '../components/HeaderReplica';
import FooterReplica from '../components/FooterReplica';
import { BRAND_NAME } from '../brand';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] dark:bg-[#050205] transition-colors duration-300">
      <HeaderReplica onOpenCart={() => {}} />

      <main className="flex-grow flex items-center justify-center py-24 px-6 mt-16">
        <div className="max-w-xl w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 shadow-2xl border border-black/5 dark:border-white/5 text-center"
          >
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-black uppercase tracking-tight mb-4 font-retro">Payment Successful</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              Thank you for choosing {BRAND_NAME}. Your order has been confirmed and is being prepared in our lab.
            </p>

            <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl p-6 mb-10 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Order ID</span>
                <span className="text-sm font-black font-mono">{orderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Status</span>
                <span className="text-[10px] font-black uppercase bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                  Confirmed
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="flex-1 do-btn-primary py-4 flex items-center justify-center gap-2"
              >
                Continue Shopping
                <ShoppingBag className="w-4 h-4" />
              </Link>
              <Link
                to="/?track=orders"
                className="flex-1 flex items-center justify-center gap-2 border-2 border-black/10 dark:border-white/10 rounded-full py-4 text-xs font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Track Order
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterReplica />
    </div>
  );
}
