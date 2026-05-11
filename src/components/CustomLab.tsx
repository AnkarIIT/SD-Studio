import { type FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Send, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomLab() {
  const [form, setForm] = useState({ name: '', email: '', details: '', fileName: '' });

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.details.trim()) {
      toast.error('Please complete the custom order brief');
      return;
    }

    const requestId = `LB-CUSTOM-${Date.now().toString(36).toUpperCase()}`;
    localStorage.setItem(requestId, JSON.stringify({ ...form, createdAt: new Date().toISOString() }));
    toast.success(`Custom request ${requestId} submitted`);
    setForm({ name: '', email: '', details: '', fileName: '' });
  };

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 overflow-hidden transition-colors" id="custom-lab">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900 dark:bg-zinc-800 absolute top-0 left-0 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              <Cpu className="w-3.5 h-3.5" /> LB_LAB_PROTOCOL_2026
            </div>
            <div className="mt-12">
              <h2 className="text-5xl md:text-[6rem] font-serif font-black uppercase tracking-tighter italic leading-[0.8] text-zinc-900 dark:text-zinc-100 mb-8">
                Bespoke <br />
                <span className="text-primary underline decoration-zinc-100 dark:decoration-zinc-800 underline-offset-10">Fabrication</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed max-w-md mb-12 font-medium">
                Have a custom design or an .STL file ready? Our laboratory handles technical implementation with extreme precision.
              </p>

              <div className="space-y-10">
                <div className="flex gap-8 items-start">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center flex-shrink-0 font-serif font-black italic text-2xl text-primary">
                    01
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-xs text-zinc-900 dark:text-zinc-100 mb-2">Upload Geometry</h4>
                    <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">Supported formats: .STL, .OBJ, .STEP (Max 100MB)</p>
                  </div>
                </div>
                <div className="flex gap-8 items-start">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center flex-shrink-0 font-serif font-black italic text-2xl text-primary">
                    02
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-xs text-zinc-900 dark:text-zinc-100 mb-2">Select Material</h4>
                    <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">Medical Grade Resin, CF-ASA, PET-G, High-Detail Wax</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 md:p-12 relative border border-zinc-100 dark:border-zinc-800 transition-colors">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Collaborator Name</label>
                  <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} type="text" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 focus:outline-none focus:border-primary text-zinc-900 dark:text-zinc-100 transition-all uppercase text-xs font-black tracking-widest" placeholder="YOUR FULL NAME" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Communication Ref</label>
                  <input value={form.email} onChange={(e) => updateForm('email', e.target.value)} type="email" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 focus:outline-none focus:border-primary text-zinc-900 dark:text-zinc-100 transition-all uppercase text-xs font-black tracking-widest" placeholder="YOUR@EMAIL.SH" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Project Parameters</label>
                <textarea value={form.details} onChange={(e) => updateForm('details', e.target.value)} rows={4} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 focus:outline-none focus:border-primary text-zinc-900 dark:text-zinc-100 transition-all uppercase text-xs font-black tracking-widest resize-none" placeholder="DESCRIBE YOUR GEOMETRY REQUIREMENTS..." />
              </div>

              <label className="block border-4 border-dotted border-zinc-200 dark:border-zinc-800 p-12 text-center group hover:border-primary transition-all cursor-pointer bg-white dark:bg-zinc-900">
                <input
                  type="file"
                  accept=".stl,.obj,.step,.stp"
                  className="hidden"
                  onChange={(e) => updateForm('fileName', e.target.files?.[0]?.name ?? '')}
                />
                <Upload className="w-10 h-10 text-zinc-200 dark:text-zinc-800 mx-auto mb-4 group-hover:text-primary group-hover:-translate-y-2 transition-all" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                  {form.fileName || 'Transmit .STL Geometry'}
                </p>
              </label>

              <button className="w-full py-6 bg-primary text-white font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-primary-dark transition-all hvr-sweep-to-right">
                Initiate Protocol <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
