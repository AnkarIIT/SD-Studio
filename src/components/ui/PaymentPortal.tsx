import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, CreditCard, Lock, Sparkles, 
  Loader2, CheckCircle2, Zap, ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface PaymentPortalProps {
  amount: number;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
  customerName: string;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ amount, onSuccess, onCancel, customerName }) => {
  const [step, setStep] = useState<'card' | 'processing'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: customerName || ''
  });

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // Artificial high-fidelity delay for "verification"
    setTimeout(() => {
      onSuccess(`SD_TX_${Math.random().toString(36).substring(2, 11).toUpperCase()}`);
    }, 3500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return value;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/90 backdrop-blur-3xl"
        onClick={onCancel}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative z-10 border border-white/20"
      >
        {/* Portal Banner */}
        <div className="bg-gray-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-400">SD Secure Gateway</span>
            </div>
            <div className="flex justify-between items-end">
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">LAB <br/> <span className="italic text-violet-400">TRANSFER.</span></h2>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Authorization</p>
                <p className="text-3xl font-black tracking-tighter italic text-white">₹{amount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-12">
          <AnimatePresence mode="wait">
            {step === 'card' ? (
              <motion.form 
                key="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handlePay}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block pl-4">Account Holder</label>
                    <input 
                      required
                      value={cardData.name}
                      onChange={(e) => setCardData({...cardData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-600 focus:bg-white transition-all font-bold text-sm uppercase tracking-widest"
                      placeholder="NAME ON CARD"
                    />
                  </div>

                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block pl-4">Identification Number</label>
                    <div className="relative">
                      <input 
                        required
                        maxLength={19}
                        value={cardData.number}
                        onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 pl-14 outline-none focus:border-violet-600 focus:bg-white transition-all font-black text-sm tracking-[0.2em]"
                        placeholder="0000 0000 0000 0000"
                      />
                      <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-violet-600 transition-colors" size={20} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block pl-4">Validity</label>
                       <input 
                        required
                        maxLength={5}
                        value={cardData.expiry}
                        onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-violet-600 focus:bg-white transition-all font-black text-sm tracking-[0.2em]"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="relative">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block pl-4">Security Key</label>
                       <div className="relative">
                        <input 
                          required
                          maxLength={3}
                          type="password"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 pl-12 outline-none focus:border-violet-600 focus:bg-white transition-all font-black text-sm tracking-[0.5em]"
                          placeholder="***"
                        />
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    type="submit"
                    className="w-full bg-gray-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:bg-violet-600 transition-all shadow-2xl shadow-violet-200 active:scale-95 group"
                  >
                    SECURE AUTHORIZATION <Zap size={14} className="fill-current group-hover:scale-125 transition-transform" />
                  </button>
                  <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-6 flex items-center justify-center gap-2">
                    <Lock size={10} /> PCI-DSS COMPLIANT ENCRYPTION
                  </p>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="relative mb-12">
                   <div className="absolute inset-0 bg-violet-600 rounded-full blur-[60px] opacity-20 animate-pulse" />
                   <div className="w-24 h-24 rounded-full border-2 border-gray-100 flex items-center justify-center relative z-10">
                      <Loader2 size={48} className="text-violet-600 animate-spin" />
                   </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">Securing Channel...</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Encrypting Transaction Metadata
                  </p>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" /> Establishing Handshake with SD Nodes
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
           <button 
             type="button"
             onClick={onCancel}
             className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
           >
             Cancel Mission
           </button>
           <div className="flex items-center gap-2 opacity-30">
              <ShieldAlert size={14} />
              <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Lab Protection</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPortal;
