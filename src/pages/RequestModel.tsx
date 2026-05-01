import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UploadCloud, Sparkles, Box, Droplets, Zap, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const requestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  description: z.string().min(10, "Please describe your project"),
});

type RequestFormData = z.infer<typeof requestSchema>;

const RequestModel = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [selectedMaterial, setSelectedMaterial] = useState('PLA');
  const [selectedInfill, setSelectedInfill] = useState('20%');
  const [file, setFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema)
  });

  const onSubmit = async (data: RequestFormData) => {
    setStatus('submitting');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStatus('success');
    reset();
    setFile(null);
    setTimeout(() => setStatus('idle'), 5000);
  };

  const materials = [
    { id: 'PLA', name: 'Standard PLA', icon: Box, desc: 'Tough & Vibrant', price: '₹' },
    { id: 'Resin', name: 'High Detail Resin', icon: Droplets, desc: 'Smooth & Precise', price: '₹₹' },
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

        <div className="grid lg:grid-cols-3 gap-12 items-start">
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
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                />
                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center transition-all duration-500
                    ${file ? 'bg-green-500 text-white rotate-0' : 'bg-white text-violet-500 shadow-xl group-hover:scale-110 group-hover:rotate-6'}`}>
                    <UploadCloud size={32} />
                  </div>
                  {file ? (
                    <div>
                      <p className="text-gray-900 font-bold uppercase tracking-tight mb-2">{file.name}</p>
                      <p className="text-green-600 text-[10px] font-black uppercase tracking-widest">Ready to Print</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900 font-black uppercase tracking-tight mb-2 text-lg">Select STL or OBJ File</p>
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input {...register('name')} placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm" />
                  <input {...register('email')} placeholder="Email Address" className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm" />
                </div>
                <input {...register('phone')} placeholder="Phone Number" className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm" />
                <textarea {...register('description')} rows={4} placeholder="Tell us about your project..." className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm resize-none" />
                
                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-green-500 text-white p-6 rounded-3xl flex items-center gap-4 shadow-xl"
                    >
                      <CheckCircle2 size={24} />
                      <div>
                        <p className="font-black uppercase tracking-tight text-sm">Magic in Progress!</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">We've received your coordinates and file.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Production Priority</span>
                    <span className="font-black uppercase text-sm tracking-tight">Standard</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Estimated Magic</span>
                    <span className="text-3xl font-black tracking-tighter">₹Custom</span>
                  </div>
                </div>

                <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold leading-relaxed mb-10 italic">
                  *Final quote will be sent to your email after technical review of the 3D model.
                </p>

                <button 
                  onClick={handleSubmit(onSubmit)}
                  disabled={status === 'submitting'}
                  className="w-full bg-violet-600 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-4 hover:bg-violet-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-violet-600/20 disabled:opacity-50 group"
                >
                  {status === 'submitting' ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      INITIATE PRODUCTION
                      <Zap size={16} className="fill-current group-hover:scale-125 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RequestModel;
