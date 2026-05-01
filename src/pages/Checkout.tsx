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
import { Loader2 } from 'lucide-react';

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

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  const processPayment = async (data: CheckoutFormData) => {
    if (items.length === 0) return alert("Your cart is empty!");
    
    setIsProcessing(true);
    const isLoaded = await loadRazorpayScript();
    
    if (!isLoaded) {
      alert('Razorpay failed to load. Are you online?');
      setIsProcessing(false);
      return;
    }

    const options = {
      key: 'rzp_test_YOUR_KEY_HERE', // NOTE: Replace with your actual Razorpay Key ID
      amount: getCartTotal() * 100, // Amount in paise
      currency: 'INR',
      name: 'SD Studios',
      description: 'Premium 3D Printed Gear',
      image: 'https://via.placeholder.com/150', // Replace with your logo URL
      handler: async function (response: any) {
        // Payment successful callback
        try {
          await addDoc(collection(db, 'orders'), {
            customerName: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: data.phone,
            address: `${data.address}, ${data.city} - ${data.pincode}`,
            customNotes: data.customNotes || '',
            total: getCartTotal(),
            items: items.map(item => ({ id: item.id, title: item.title, quantity: item.quantity, price: item.price })),
            status: 'Processing',
            paymentId: response.razorpay_payment_id,
            createdAt: serverTimestamp()
          });
          
          clearCart();
          alert('Payment Successful! Your order has been placed.');
          navigate('/');
        } catch (err) {
          console.error("Error saving order:", err);
          alert('Payment succeeded but failed to save order. Please contact support.');
        }
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone
      },
      theme: {
        color: '#00E5FF'
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.on('payment.failed', function (response: any) {
      alert(`Payment failed: ${response.error.description}`);
      setIsProcessing(false);
    });
    paymentObject.open();
    setIsProcessing(false); // Reset immediately because modal is open
  };

  return (
    <div className="pt-32 px-6 md:px-16 min-h-screen">
      <Helmet>
        <title>Checkout | SD Studios</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto mb-16">
        <h1 className="text-5xl md:text-7xl font-black mb-4">SECURE <span className="text-brand-cyan">CHECKOUT</span></h1>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_400px] gap-12 pb-32">
        <div className="space-y-8">
          <div className="glass p-8 rounded-3xl border border-white/10">
            <h2 className="text-xl font-heading tracking-widest uppercase mb-6">Shipping Details</h2>
            <form id="checkout-form" onSubmit={handleSubmit(processPayment)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <input {...register('firstName')} placeholder="First Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors font-light" />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <input {...register('lastName')} placeholder="Last Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors font-light" />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <input {...register('email')} type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors font-light" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <input {...register('phone')} type="tel" placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors font-light" />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div>
                <input {...register('address')} placeholder="Full Address (Street, Apartment, etc.)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors font-light" />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <input {...register('city')} placeholder="City" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors font-light" />
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <input {...register('pincode')} placeholder="PIN Code" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors font-light" />
                  {errors.pincode && <p className="text-red-400 text-xs mt-1">{errors.pincode.message}</p>}
                </div>
              </div>
              <div>
                <textarea {...register('customNotes')} placeholder="Order Notes or Customization Requests (Optional)" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors font-light resize-none" />
              </div>
            </form>
          </div>
          
          <div className="glass p-8 rounded-3xl border border-white/10">
             <h2 className="text-xl font-heading tracking-widest uppercase mb-6">Payment</h2>
             <div className="bg-white/5 border border-brand-cyan/50 rounded-xl p-6 flex items-center gap-4 cursor-pointer">
                <div className="w-4 h-4 rounded-full border-2 border-brand-cyan bg-brand-cyan flex items-center justify-center shadow-[0_0_10px_rgba(163,198,34,0.5)]">
                  <div className="w-2 h-2 rounded-full bg-black" />
                </div>
                <span className="font-bold tracking-widest uppercase text-sm">Pay Online (Razorpay)</span>
             </div>
          </div>
        </div>

        <div>
          <div className="glass p-8 rounded-3xl border border-white/10 sticky top-32">
            <h2 className="text-xl font-heading tracking-widest uppercase mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-white/70 font-light line-clamp-1 flex-1 pr-4">{item.quantity}x {item.title}</span>
                  <span className="font-bold">₹{parseInt(item.price.replace(/\D/g, '')) * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-6 space-y-4">
               <div className="flex justify-between text-sm text-white/50">
                 <span>Subtotal</span>
                 <span>₹{getCartTotal()}</span>
               </div>
               <div className="flex justify-between text-sm text-white/50">
                 <span>Shipping</span>
                 <span>Free</span>
               </div>
               <div className="flex justify-between text-xl font-black pt-4 border-t border-white/10 text-brand-cyan">
                 <span>Total</span>
                 <span>₹{getCartTotal()}</span>
               </div>
            </div>
            <button 
              form="checkout-form"
              type="submit"
              disabled={isProcessing || items.length === 0}
              className="w-full bg-brand-cyan text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm mt-8 shadow-[0_0_30px_rgba(163,198,34,0.2)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
