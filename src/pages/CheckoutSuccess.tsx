import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sendOrderConfirmation } from '../lib/email';
import { useCartStore } from '../store/useCartStore';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('orderId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queuePos, setQueuePos] = useState<number | null>(null);
  const { clearCart } = useCartStore();
  const processedRef = useRef(false);

  useEffect(() => {
    const verifyAndFinalize = async () => {
      if (!sessionId || !orderId || processedRef.current) return;
      processedRef.current = true;

      try {
        // 1. Verify Stripe Session
        const response = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`);
        const sessionData = await response.json();

        if (sessionData.status === 'paid') {
          // 2. Get Order Data
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await getDoc(orderRef);
          
          if (orderSnap.exists()) {
            const orderData = orderSnap.data();
            
            // Only finalize if still pending
            if (orderData.status === 'Pending') {
              // 3. Calculate Queue Position
              const q = query(collection(db, 'orders'), where('status', '==', 'Processing'));
              const snapshot = await getDocs(q);
              const position = snapshot.size + 1;
              setQueuePos(position);

              // 4. Update Firestore
              await updateDoc(orderRef, {
                status: 'Processing',
                stripeSessionId: sessionId,
                queuePosition: position
              });

              // 5. Send Confirmation Email
              await sendOrderConfirmation(
                orderData.email,
                orderId,
                orderData.customerName,
                orderData.totalCost || orderData.total,
                position
              );

              // 6. Clear Cart if it was a standard order
              if (sessionData.metadata.type === 'standard') {
                clearCart();
              }
            } else {
              // Already processed
              setQueuePos(orderData.queuePosition || 1);
            }
          }
        } else {
          setError('Payment was not successful. Please check your card or try again.');
        }
      } catch (err: any) {
        console.error('Finalization Error:', err);
        setError('Something went wrong while securing your order. Our team has been notified.');
      } finally {
        setLoading(false);
      }
    };

    verifyAndFinalize();
  }, [sessionId, orderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <Loader2 className="text-violet-500 animate-spin mb-6" size={64} />
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Securing the Mission...</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-4">Verifying payment & calculating queue</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={40} className="rotate-45" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-4">Payment Check Failed</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">{error}</p>
        <button onClick={() => navigate('/shop')} className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-40 px-6 md:px-16 min-h-screen relative overflow-hidden bg-white">
      <Helmet>
        <title>Mission Secured | SD Studios</title>
      </Helmet>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-200"
        >
           <CheckCircle2 size={48} />
        </motion.div>
        
        <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-6 uppercase">Order Secured!</h1>
        <p className="text-gray-500 font-medium mb-12 leading-relaxed">
          Your payment was successful and your gear is now in the manufacturing queue. <br/> 
          We've sent a high-fidelity confirmation to your email.
        </p>
        
        <div className="bg-gray-50 rounded-[3rem] p-10 mb-12 border border-gray-100 text-left">
           <div className="mb-10">
             <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-violet-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Lab Status</p>
             </div>
             <div className="bg-violet-600 text-white p-8 rounded-[2rem] text-center shadow-xl shadow-violet-200">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Queue Position</p>
                <p className="text-5xl font-black">#{queuePos}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-4">Orders ahead of you: {Math.max(0, (queuePos || 1) - 1)}</p>
             </div>
           </div>

           <div className="mb-8">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2 pl-2">Order Reference</p>
             <div className="flex items-center justify-between bg-white border border-gray-100 p-5 rounded-2xl">
                <p className="text-xl font-black text-violet-600 tracking-wider">#{orderId?.toUpperCase()}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(orderId || '');
                    alert('Order ID copied!');
                  }}
                  className="p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-violet-600"
                >
                  <Copy size={20} />
                </button>
             </div>
           </div>

           <button 
             type="button"
             onClick={() => navigate(`/track?id=${orderId}`)}
             className="w-full py-6 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-violet-600 transition-all shadow-xl shadow-violet-600/10"
           >
             Track Manufacturing <ExternalLink size={14} />
           </button>
        </div>

        <button 
          onClick={() => navigate('/shop')}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-violet-600 transition-colors"
        >
          Return to Lab
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
