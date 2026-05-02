import { Helmet } from 'react-helmet-async';
import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, Search, CheckCircle2, Box, Truck, Sparkles, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const orderJustPlaced = Boolean((location.state as { orderPlaced?: boolean } | null)?.orderPlaced);

  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchOrderById = useCallback(async (rawId: string) => {
    const id = rawId.trim();
    if (!id) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrderData({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("We couldn't find that Order ID. Please double check it!");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching the order.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fromQuery = searchParams.get('order')?.trim();
    if (fromQuery) {
      setOrderId(fromQuery);
      void fetchOrderById(fromQuery);
    }
  }, [searchParams, fetchOrderById]);

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    await fetchOrderById(orderId);
  };

  const statusSteps = [
    { label: 'Received', icon: CheckCircle2, status: 'pending' },
    { label: 'Processing', icon: Settings, status: 'processing' },
    { label: '3D Printing', icon: Box, status: 'printing' },
    { label: 'Shipped', icon: Truck, status: 'shipped' }
  ];

  const getCurrentStep = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'printing') return 2;
    if (s === 'processing') return 1;
    return 0;
  };

  return (
    <div className="pt-32 pb-40 px-6 md:px-16 min-h-screen relative overflow-hidden bg-white">
      <Helmet>
        <title>Track Your Magic | SD Studios</title>
      </Helmet>

      {/* Background Playful Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
      </div>

      <div className="max-w-[800px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-2 mb-4">
             <Sparkles size={16} className="text-violet-500" />
             <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.4em]">Order Status</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85] mb-8">
            Track Your <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">Magic.</span>
          </h1>

          {orderJustPlaced && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mb-6 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 text-xs font-bold"
            >
              Payment successful — your order is saved. The ID below matches your receipt.
            </motion.p>
          )}
          
          <form onSubmit={handleTrack} className="max-w-md mx-auto flex gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID" 
                className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm shadow-sm"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                <Search size={18} />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gray-900 text-white p-5 rounded-2xl hover:bg-black active:scale-90 transition-all shadow-xl shadow-gray-100 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            </button>
          </form>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-[10px] mt-6 font-black uppercase tracking-widest"
            >
              {error}
            </motion.p>
          )}
        </div>

        <AnimatePresence>
          {orderData && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Status Timeline */}
              <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-16">
                   <div className="grid md:grid-cols-4 gap-8 w-full relative">
                      {/* Connector Line */}
                      <div className="absolute top-6 left-10 right-10 h-0.5 bg-gray-100 hidden md:block" />
                      <div 
                        className="absolute top-6 left-10 h-0.5 bg-violet-500 transition-all duration-1000 hidden md:block" 
                        style={{ width: `${(getCurrentStep(orderData.status) / 3) * 80}%` }} 
                      />

                      {statusSteps.map((step, idx) => {
                        const isActive = getCurrentStep(orderData.status) >= idx;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg
                              ${isActive ? 'bg-violet-600 text-white scale-110' : 'bg-gray-50 text-gray-300'}`}>
                               <step.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest text-center
                              ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-gray-50">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Order Identification</p>
                    <p className="font-mono text-xs text-gray-900 font-bold bg-gray-50 px-4 py-2 rounded-xl">{orderData.id}</p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Current Lab Status</p>
                    <span className="bg-violet-50 text-violet-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-100">
                      {orderData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl">
                  <h4 className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-8">Creation Manifest</h4>
                  <div className="space-y-6">
                    {(orderData.items ?? []).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-black text-xs">
                             {item.quantity}
                           </div>
                           <span className="text-gray-900 font-bold text-sm tracking-tight">{item.title}</span>
                        </div>
                        <span className="text-gray-400 font-bold text-sm italic">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                  <h4 className="text-violet-400 font-black text-[10px] uppercase tracking-widest relative z-10">Total Contribution</h4>
                  <div className="relative z-10 pt-10">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-2">Including GST & Shipping</p>
                    <p className="text-5xl font-black tracking-tighter">₹{orderData.total}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackOrder;
