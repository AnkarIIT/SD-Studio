import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: data.name,
        email: data.email,
        message: data.message,
        createdAt: serverTimestamp(),
      });

      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? 'YOUR_SERVICE_ID';
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? 'YOUR_TEMPLATE_ID';
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? 'YOUR_PUBLIC_KEY';

      if (SERVICE_ID !== 'YOUR_SERVICE_ID' && formRef.current) {
        await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY);
      }

      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to send message', error);
      setStatus('idle');
      alert('Could not send your message. Please try again or email us directly.');
    }
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 w-full max-w-2xl mx-auto shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden group">
      {/* Playful Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
           <Sparkles size={16} className="text-violet-500" />
           <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.4em]">Get in Touch</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 text-gray-900 leading-none uppercase">
          Say <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic font-normal">Hello.</span>
        </h2>
        
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Your Name</label>
            <input 
              id="name"
              {...register('name')}
              placeholder="Your Name"
              aria-label="Full name"
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm text-gray-900 shadow-sm"
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-2 uppercase font-bold tracking-widest pl-4" role="alert">{errors.name.message}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="sr-only">Email Address</label>
            <input 
              id="email"
              {...register('email')}
              placeholder="Email Address"
              aria-label="Email address"
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm text-gray-900 shadow-sm"
            />
            {errors.email && <p className="text-red-500 text-[10px] mt-2 uppercase font-bold tracking-widest pl-4" role="alert">{errors.email.message}</p>}
          </div>
          
          <div>
            <label htmlFor="message" className="sr-only">Your Message</label>
            <textarea 
              id="message"
              {...register('message')}
              placeholder="Your Message..."
              aria-label="Message content"
              rows={4}
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all font-medium text-sm text-gray-900 resize-none shadow-sm"
            />
            {errors.message && <p className="text-red-500 text-[10px] mt-2 uppercase font-bold tracking-widest pl-4" role="alert">{errors.message.message}</p>}
          </div>

          <button 
            disabled={status === 'submitting'}
            className="w-full bg-gray-900 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-4 hover:bg-violet-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-xs shadow-xl shadow-gray-100 group/btn"
          >
            {status === 'submitting' ? (
              <Loader2 className="animate-spin" size={18} />
            ) : status === 'success' ? (
              "Message Sent! ✨"
            ) : (
              <>
                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
