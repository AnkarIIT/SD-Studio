import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UploadCloud, Sparkles, Box, Droplets, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { sendOrderConfirmation } from '../lib/email';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { loadRazorpayScript } from '../lib/razorpay';
import { useEffect } from 'react';

const requestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  description: z.string().min(10, "Please describe your project"),
});

type RequestFormData = z.infer<typeof requestSchema>;

import PaymentPortal from '../components/ui/PaymentPortal';

const RequestModel = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [selectedMaterial, setSelectedMaterial] = useState('PLA');
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [quoteResults, setQuoteResults] = useState<{ weight: number, price: number } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [pendingData, setPendingData] = useState<RequestFormData | null>(null);
  
  // Persistence Keys
  const STORAGE_KEY = 'sd_studios_request_draft';

  // LAB COST CONFIGURATION
  const LAB_CONFIG = {
    materialDensity: { PLA: 1.24, PETG: 1.27, TPU: 1.21 },
    infillFactor: 0.4,
    costPerGram: 2.5,
    laborFee: 150,
    profitMargin: 2.1
  };

  const calculateSTLVolume = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const view = new DataView(buffer);
        if (buffer.byteLength < 84) return resolve(0);
        
        try {
          const facetCount = view.getUint32(80, true);
          let totalVolume = 0;
          for (let i = 0; i < Math.min(facetCount, 100000); i++) { // Limit for browser performance
            const offset = 84 + i * 50;
            const v1 = { x: view.getFloat32(offset + 12, true), y: view.getFloat32(offset + 16, true), z: view.getFloat32(offset + 20, true) };
            const v2 = { x: view.getFloat32(offset + 24, true), y: view.getFloat32(offset + 28, true), z: view.getFloat32(offset + 32, true) };
            const v3 = { x: view.getFloat32(offset + 36, true), y: view.getFloat32(offset + 40, true), z: view.getFloat32(offset + 44, true) };
            totalVolume += (1.0/6.0) * (
              -v3.x * v2.y * v1.z + v2.x * v3.y * v1.z + v3.x * v1.y * v2.z - 
              v1.x * v3.y * v2.z - v2.x * v1.y * v3.z + v1.x * v2.y * v3.z
            );
          }
          resolve(Math.abs(totalVolume) / 1000);
        } catch (e) { resolve(0); }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);
    if (uploadedFile && uploadedFile.name.toLowerCase().endsWith('.stl')) {
      setAnalyzing(true);
      const volume = await calculateSTLVolume(uploadedFile);
      const density = LAB_CONFIG.materialDensity[selectedMaterial as keyof typeof LAB_CONFIG.materialDensity] || 1.24;
      
      const estimatedWeight = Math.max(1, volume * density * LAB_CONFIG.infillFactor);
      const makingCost = (estimatedWeight * LAB_CONFIG.costPerGram) + LAB_CONFIG.laborFee;
      const finalPrice = Math.ceil(makingCost * LAB_CONFIG.profitMargin);
      
      setQuoteResults({ weight: Math.round(estimatedWeight), price: finalPrice });
      setAnalyzing(false);
    } else {
      setQuoteResults(null);
    }
  };

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema)
  });

  // Load Draft from Cache
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const draft = JSON.parse(saved);
      Object.keys(draft).forEach((key) => {
        setValue(key as any, draft[key]);
      });
      if (draft.material) setSelectedMaterial(draft.material);
    }
  }, [setValue]);

  // Save Draft to Cache
  const formValues = watch();
  useEffect(() => {
    const draft = { ...formValues, material: selectedMaterial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [formValues, selectedMaterial]);

  const getQueuePosition = async () => {
    try {
      const q = query(collection(db, 'orders'), where('status', '==', 'Processing'));
      const snapshot = await getDocs(q);
      return snapshot.size + 1;
    } catch (e) {
      return 1;
    }
  };

  const initiatePayment = async (data: RequestFormData) => {
    if (!file || !quoteResults) {
      alert("Please upload and analyze a 3D model first!");
      return;
    }
    setPendingData(data);
    setShowPortal(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!pendingData || !quoteResults || !file) return;
    setStatus('submitting');
    
    try {
      const queuePos = await getQueuePosition();
      const docRef = await addDoc(collection(db, 'orders'), {
        customerName: pendingData.name,
        email: pendingData.email,
        phone: pendingData.phone,
        description: pendingData.description,
        type: 'custom',
        fileName: file.name,
        material: selectedMaterial,
        weight: quoteResults.weight,
        totalCost: quoteResults.price,
        status: 'Processing',
        paymentMethod: 'Custom Lab Transfer',
        transactionId: transactionId,
        queuePosition: queuePos,
        createdAt: serverTimestamp()
      });
      
      setOrderId(docRef.id);
      setStatus('success');
      setShowPortal(false);
      localStorage.removeItem(STORAGE_KEY);
      
      // Send confirmation email
      await sendOrderConfirmation(
        pendingData.email, 
        docRef.id, 
        pendingData.name, 
        quoteResults.price.toString(),
        queuePos
      );
      
      reset();
      setFile(null);
      setQuoteResults(null);
    } catch (err: any) {
      console.error("Order Error:", err);
      alert(`Failed to secure order: ${err.message}`);
      setStatus('idle');
    }
  };

  const materials = [
    { id: 'PLA', name: 'Standard PLA', icon: Box, desc: 'Tough & Vibrant', price: '₹' },
    { id: 'PETG', name: 'High Performance PETG', icon: ShieldCheck, desc: 'Smooth & Precise', price: '₹₹' },
    { id: 'TPU', name: 'Flexible TPU', icon: Zap, desc: 'Rubber-like Strength', price: '₹₹' }
  ];

  return (
    <div className="pt-32 pb-40 px-6 md:px-16 min-h-screen relative overflow-hidden bg-white">
      <Helmet>
        <title>The Lab | SD Studios</title>
      </Helmet>

      {/* Background Playful Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
             <Sparkles size={16} className="text-violet-500" />
             <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.4em]">Custom Engine</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85]">
            Start Your <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">Creation.</span>
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto py-20 text-center"
            >
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-200">
                 <CheckCircle2 size={48} />
              </div>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-6 uppercase">Order Received!</h2>
              <p className="text-gray-500 font-medium mb-12 leading-relaxed">
                Your custom 3D model is now in the manufacturing queue. <br/> 
                Our lab technicians will review the geometry and reach out via email.
              </p>
              
              <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Order Reference</p>
                 <p className="text-xl font-black text-violet-600 tracking-wider">#{orderId?.slice(-8).toUpperCase()}</p>
              </div>

              <button 
                onClick={() => setStatus('idle')}
                className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-violet-600 transition-all shadow-xl"
              >
                Back to Lab
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-3 gap-12 items-start"
            >
              {showPortal && (
                <PaymentPortal 
                  amount={quoteResults?.price || 0} 
                  customerName={pendingData ? pendingData.name : ''}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setShowPortal(false)}
                />
              )}

              {/* Left Column: Configuration */}
              <div className="lg:col-span-2 space-y-12">
                
                {/* 1. File Upload Dropzone */}
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">1</span>
                    Drop Your Design
                  </h3>
                  <div 
                    className={`relative border-4 border-dashed rounded-[3rem] p-12 text-center transition-all duration-500 group
                      ${file ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-violet-300 hover:bg-violet-50'}`}
                  >
                    <input 
                      type="file" 
                      accept=".stl"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                    />
                    <div className="relative z-10">
                      <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center transition-all duration-500
                        ${file ? 'bg-green-500 text-white rotate-0' : 'bg-white text-violet-500 shadow-xl group-hover:scale-110 group-hover:rotate-6'}`}>
                        {analyzing ? <Loader2 className="animate-spin" size={32} /> : <UploadCloud size={32} />}
                      </div>
                      {file ? (
                        <div>
                          <p className="text-gray-900 font-bold uppercase tracking-tight mb-2">{file.name}</p>
                          <p className="text-green-600 text-[10px] font-black uppercase tracking-widest">
                            {analyzing ? "Analyzing Geometry..." : "Lab Scan Complete"}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-900 font-black uppercase tracking-tight mb-2 text-lg">Select STL File</p>
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            Drag and drop your 3D model here <br/> or click to browse
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Material Selection */}
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">2</span>
                    Choose Material
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {materials.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => setSelectedMaterial(mat.id)}
                        className={`p-8 rounded-[2rem] border-2 text-left transition-all duration-500 group relative overflow-hidden
                          ${selectedMaterial === mat.id ? 'border-violet-600 bg-violet-600 text-white shadow-2xl' : 'border-gray-100 bg-white hover:border-violet-200 shadow-sm'}`}
                      >
                        <mat.icon size={24} className={`mb-6 ${selectedMaterial === mat.id ? 'text-white' : 'text-violet-500'}`} />
                        <h4 className="font-black text-sm uppercase tracking-tight mb-1">{mat.name}</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedMaterial === mat.id ? 'text-violet-200' : 'text-gray-400'}`}>{mat.desc}</p>
                        <div className="absolute top-6 right-6">
                           <span className={`text-[10px] font-black ${selectedMaterial === mat.id ? 'text-violet-200' : 'text-violet-500'}`}>{mat.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. The Form */}
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">3</span>
                    Lab Coordinates
                  </h3>
                  <form onSubmit={handleSubmit(initiatePayment)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <input {...register('name')} placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm" />
                        {errors.name && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase pl-4">{errors.name.message}</p>}
                      </div>
                      <div>
                        <input {...register('email')} placeholder="Email Address" className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm" />
                        {errors.email && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase pl-4">{errors.email.message}</p>}
                      </div>
                    </div>
                    <input {...register('phone')} placeholder="Phone Number" className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm" />
                    <textarea {...register('description')} rows={4} placeholder="Tell us about your project..." className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm resize-none" />
                  </form>
                </div>
              </div>

              {/* Right Column: Sticky Quote Card */}
              <div className="lg:sticky lg:top-32">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600 rounded-full blur-[80px] opacity-40 -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative z-10">
                    <h4 className="text-violet-400 font-black text-[10px] uppercase tracking-[0.3em] mb-8">Live Quote Engine</h4>
                    
                    <div className="space-y-8 mb-12">
                      <div className="flex justify-between items-center pb-6 border-b border-white/10">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Base Material</span>
                        <span className="font-black uppercase text-sm tracking-tight">{selectedMaterial}</span>
                      </div>
                      <div className="flex justify-between items-center pb-6 border-b border-white/10">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Est. Weight</span>
                        <span className="font-black uppercase text-sm tracking-tight">{quoteResults ? `${quoteResults.weight}g` : '--'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Estimated Magic</span>
                        <span className="text-3xl font-black tracking-tighter">
                          {quoteResults ? `₹${quoteResults.price}` : '₹---'}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold leading-relaxed mb-10 italic">
                      *Final quote will be sent to your email after technical review of the 3D model.
                    </p>

                    <button 
                      onClick={handleSubmit(initiatePayment)}
                      disabled={isProcessing || !file || status === 'submitting'}
                      className="w-full bg-violet-600 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-4 hover:bg-violet-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-violet-600/20 disabled:opacity-50 group"
                    >
                      {isProcessing || status === 'submitting' ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          SECURE PAYMENT
                          <Zap size={16} className="fill-current group-hover:scale-125 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RequestModel;
