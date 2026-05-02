import { Helmet } from 'react-helmet-async';
import { useCartStore } from '../store/useCartStore';
import { loadRazorpayScript } from '../lib/razorpay';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Loader2, CheckCircle2, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendOrderConfirmation } from '../lib/email';

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Full address is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(6, "Valid PIN code required"),
  customNotes: z.string().optional()
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

import PaymentPortal from '../components/ui/PaymentPortal';

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [pendingData, setPendingData] = useState<CheckoutFormData | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  const initiatePayment = async (data: CheckoutFormData) => {
    if (items.length === 0) return alert("Your cart is empty!");
    setPendingData(data);
    setShowPortal(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!pendingData) return;
    setIsProcessing(true);
    
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        customerName: `${pendingData.firstName} ${pendingData.lastName}`,
        email: pendingData.email,
        phone: pendingData.phone,
        address: `${pendingData.address}, ${pendingData.city} - ${pendingData.pincode}`,
        customNotes: pendingData.customNotes || '',
        total: getCartTotal(),
        items: items.map(item => ({ id: item.id, title: item.title, quantity: item.quantity, price: item.price })),
        status: 'Processing',
        paymentMethod: 'Custom Lab Transfer',
        transactionId: transactionId,
        createdAt: serverTimestamp()
      });

      setOrderId(docRef.id);
      setIsSuccess(true);
      setShowPortal(false);
      clearCart();
      
      // Send confirmation email
      await sendOrderConfirmation(
        pendingData.email, 
        docRef.id, 
        `${pendingData.firstName} ${pendingData.lastName}`, 
        getCartTotal().toString()
      );
    } catch (err: any) {
      console.error("Order Error:", err);
      alert(`Failed to secure order: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-32 px-6 md:px-16 min-h-screen relative overflow-hidden bg-white">
      <Helmet>
        <title>Checkout | SD Studios</title>
      </Helmet>
      
      {/* Background Playful Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto py-20 text-center relative z-10"
          >
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-200">
               <CheckCircle2 size={48} />
            </div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-6 uppercase">Order Secured!</h2>
            <p className="text-gray-500 font-medium mb-12 leading-relaxed">
              Your payment was successful and your gear is now in the manufacturing queue. <br/> 
              We've sent a confirmation to your email.
            </p>
            
            <div className="bg-gray-50 rounded-[2.5rem] p-10 mb-12 border border-gray-100 text-left">
               <div className="mb-8">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Order Reference</p>
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

               <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 text-center">Next Step</p>
                 <button 
                   type="button"
                   onClick={() => navigate(`/track?order=${encodeURIComponent(orderId || '')}`)}
                   className="w-full py-6 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-violet-600 transition-all shadow-xl shadow-violet-600/10"
                 >
                   Track Manufacturing <ExternalLink size={14} />
                 </button>
               </div>
            </div>

            <button 
              onClick={() => navigate('/shop')}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-violet-600 transition-colors"
            >
              Continue Browsing
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto relative z-10"
          >
            {showPortal && (
              <PaymentPortal 
                amount={getCartTotal()} 
                customerName={pendingData ? `${pendingData.firstName} ${pendingData.lastName}` : ''}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPortal(false)}
              />
            )}

            <div className="mb-20">
              <div className="flex items-center gap-2 mb-4">
                 <Sparkles size={16} className="text-violet-500" />
                 <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.4em]">Secure Checkout</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85]">
                Finalize <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">the Mission.</span>
              </h1>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-12 pb-32">
              <div className="space-y-12">
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">1</span>
                    Shipping Details
                  </h3>
                  <form id="checkout-form" onSubmit={handleSubmit(initiatePayment)} className="grid md:grid-cols-2 gap-6 p-10 bg-gray-50 rounded-[3rem] border border-gray-100">
                    <div className="space-y-4">
                      <div>
                        <input {...register('firstName')} placeholder="First Name" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-400 transition-colors text-sm font-medium" />
                        {errors.firstName && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase pl-2">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <input {...register('lastName')} placeholder="Last Name" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-400 transition-colors text-sm font-medium" />
                        {errors.lastName && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase pl-2">{errors.lastName.message}</p>}
                      </div>
                      <div>
                        <input {...register('email')} type="email" placeholder="Email Address" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-400 transition-colors text-sm font-medium" />
                        {errors.email && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase pl-2">{errors.email.message}</p>}
                      </div>
                      <div>
                        <input {...register('phone')} type="tel" placeholder="Phone Number" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-400 transition-colors text-sm font-medium" />
                        {errors.phone && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase pl-2">{errors.phone.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <input {...register('address')} placeholder="Full Address" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-400 transition-colors text-sm font-medium" />
                      <div className="grid grid-cols-2 gap-4">
                        <input {...register('city')} placeholder="City" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-400 transition-colors text-sm font-medium" />
                        <input {...register('pincode')} placeholder="PIN Code" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-400 transition-colors text-sm font-medium" />
                      </div>
                      <textarea {...register('customNotes')} placeholder="Order Notes (Optional)" rows={3} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-400 transition-colors text-sm font-medium resize-none" />
                    </div>
                  </form>
                </div>
                
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">2</span>
                    Payment
                  </h3>
                   <div className="p-8 bg-violet-600 rounded-[2.5rem] flex items-center gap-6 shadow-2xl shadow-violet-200 group cursor-pointer">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-violet-600">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <span className="block font-black uppercase text-sm text-white tracking-widest">Pay Online</span>
                        <span className="text-xs text-violet-200 font-bold uppercase tracking-widest">Secured by Razorpay</span>
                      </div>
                   </div>
                </div>
              </div>

              <div>
                <div className="bg-gray-900 rounded-[3rem] p-10 text-white sticky top-32 shadow-2xl">
                  <h4 className="text-violet-400 font-black text-[10px] uppercase tracking-[0.3em] mb-8">Order Summary</h4>
                  <div className="space-y-6 mb-10">
                    {items.map(item => {
                      const unit = parseInt(String(item.price).replace(/\D/g, ''), 10);
                      const line = (Number.isFinite(unit) ? unit : 0) * item.quantity;
                      return (
                      <div key={item.id} className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-gray-400 line-clamp-1 flex-1 pr-4">{item.quantity}x {item.title}</span>
                        <span className="text-white italic">₹{line}</span>
                      </div>
                    );})}
                  </div>
                  <div className="border-t border-white/10 pt-8 space-y-4 mb-10">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                       <span>Subtotal</span>
                       <span>₹{getCartTotal()}</span>
                     </div>
                     <div className="flex justify-between text-2xl font-black pt-4 border-t border-white/10">
                       <span className="text-gray-400">Total</span>
                       <span className="text-white italic">₹{getCartTotal()}</span>
                     </div>
                  </div>
                  <button 
                    form="checkout-form"
                    type="submit"
                    disabled={isProcessing || items.length === 0}
                    className="w-full bg-violet-600 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-4 hover:bg-violet-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-violet-600/20 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Finalize Order"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
