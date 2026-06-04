import { type FormEvent, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Send, Cpu, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitCustomLabRequest } from '../utils/ordersApi';

export default function CustomLab() {
  const [form, setForm] = useState({ name: '', email: '', details: '', fileName: '' });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.details.trim()) {
      toast.error('Please complete the custom order brief');
      return;
    }

    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('email', form.email.trim());
    body.append('details', form.details.trim());
    if (file) body.append('file', file);

    setSubmitting(true);
    const result = await submitCustomLabRequest(body);
    setSubmitting(false);

    if (result.success) {
      toast.success(result.message ?? `Request ${result.requestId} submitted`);
      setForm({ name: '', email: '', details: '', fileName: '' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      toast.error(result.error ?? 'Could not submit request');
    }
  };

  return (
    <section className="py-14 md:py-20 bg-[#fafafa] dark:bg-zinc-900/40 border-t border-[#e8e8e8] dark:border-zinc-800" id="custom-lab">
      <div className="do-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="relative">
            <p className="do-eyebrow mb-3 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" /> Custom lab
            </p>
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold uppercase tracking-tight text-[#111] dark:text-zinc-100 mb-4">
                Upload your design
              </h2>
              <p className="text-[#6b6b6b] dark:text-zinc-400 text-base leading-relaxed max-w-md mb-10">
                Send your .STL, .OBJ or .STEP file — we quote material, print time and ship in 1–7 business days.
              </p>

              <div className="space-y-10">
                <div className="flex gap-8 items-start">
                  <div className="w-14 h-14 bg-white dark:bg-zinc-900 border border-[#e8e8e8] dark:border-zinc-700 flex items-center justify-center flex-shrink-0 text-lg font-semibold text-[#111] dark:text-white">
                    01
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-xs text-zinc-900 dark:text-zinc-100 mb-2">Upload Geometry</h4>
                    <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">Supported formats: .STL, .OBJ, .STEP (Max 100MB)</p>
                  </div>
                </div>
                <div className="flex gap-8 items-start">
                  <div className="w-14 h-14 bg-white dark:bg-zinc-900 border border-[#e8e8e8] dark:border-zinc-700 flex items-center justify-center flex-shrink-0 text-lg font-semibold text-[#111] dark:text-white">
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

          <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 border border-[#e8e8e8] dark:border-zinc-800">
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
                  ref={fileInputRef}
                  type="file"
                  accept=".stl,.obj,.step,.stp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    updateForm('fileName', f?.name ?? '');
                  }}
                />
                <Upload className="w-10 h-10 text-zinc-200 dark:text-zinc-800 mx-auto mb-4 group-hover:text-primary group-hover:-translate-y-2 transition-all" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                  {form.fileName || 'Transmit .STL Geometry'}
                </p>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="do-btn-primary w-full py-4 flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Sending…' : 'Submit request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
