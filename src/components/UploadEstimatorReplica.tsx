import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

const PRICE_PER_GRAM = 5;
const PACKAGING_COST = 30;
const ELECTRICITY_COST = 20;
const MACHINE_COST = 25;

export default function UploadEstimatorReplica() {
  const [fileName, setFileName] = useState('');
  const [volumeCm3, setVolumeCm3] = useState<number | null>(null);
  const [weightGrams, setWeightGrams] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setVolumeCm3(null);
    setWeightGrams(null);
    setPrice(null);

    try {
      const buffer = await file.arrayBuffer();
      const view = new DataView(buffer);
      if (view.byteLength < 84) {
        throw new Error('Invalid STL file');
      }

      const triangles = view.getUint32(80, true);
      let offset = 84;
      let volume = 0;

      for (let i = 0; i < triangles; i += 1) {
        if (offset + 50 > view.byteLength) break;
        offset += 12;

        const ax = view.getFloat32(offset, true); offset += 4;
        const ay = view.getFloat32(offset, true); offset += 4;
        const az = view.getFloat32(offset, true); offset += 4;
        const bx = view.getFloat32(offset, true); offset += 4;
        const by = view.getFloat32(offset, true); offset += 4;
        const bz = view.getFloat32(offset, true); offset += 4;
        const cx = view.getFloat32(offset, true); offset += 4;
        const cy = view.getFloat32(offset, true); offset += 4;
        const cz = view.getFloat32(offset, true); offset += 4;
        offset += 2;

        volume += (
          ax * by * cz +
          ay * bz * cx +
          az * bx * cy -
          az * by * cx -
          ay * bx * cz -
          ax * bz * cy
        ) / 6;
      }

      const absoluteVolume = Math.abs(volume);
      const volumeCm = absoluteVolume / 1000;
      const approxWeight = volumeCm * 0.98;
      const estimatedPrice = Math.ceil(
        approxWeight * PRICE_PER_GRAM + PACKAGING_COST + ELECTRICITY_COST + MACHINE_COST,
      );

      setVolumeCm3(volumeCm);
      setWeightGrams(approxWeight);
      setPrice(estimatedPrice);
    } catch (err) {
      setError('Unable to parse STL. Please try another file.');
    }
  };

  return (
    <section id="customize" className="py-20 bg-[#FCFBF7] dark:bg-[#090608] text-black dark:text-white transition-colors duration-300 scroll-mt-28">
      <div className="do-container">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="do-eyebrow text-zinc-500 dark:text-zinc-400">Upload Your STL</p>
            <h2 className="text-4xl font-bold uppercase tracking-[0.18em] mb-4 text-[#925FE2] dark:text-[#b995ff] font-retro mt-2">Instant accurate 3D printing estimate</h2>
            <p className="mt-4 max-w-2xl text-sm text-zinc-600 dark:text-[#c8c4ba] leading-7">
              Drag and drop your STL file to calculate volume, material weight, and estimated price in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-2 border-black dark:border-[#b995ff40] bg-[#FCFBF7] dark:bg-[#0d0a10] rounded-[28px] p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.25)] flex flex-col"
          >
            <h3 className="text-2xl font-bold mb-1 text-black dark:text-white font-retro">Upload Your STL</h3>
            <p className="text-sm text-zinc-600 dark:text-[#cfcfcf] mb-6">Instant accurate 3D printing estimate.</p>

            <label htmlFor="stlFileInput" className="border-2 border-dashed border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 rounded-2xl p-6 text-center cursor-pointer hover:border-[#925FE2] dark:hover:border-[#b995ff] transition-colors block mb-6">
              <span className="inline-flex items-center justify-center rounded-full bg-[#E6DDF2] dark:bg-[#1c132f] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#925FE2] dark:text-[#b995ff] border border-black/10 dark:border-transparent mb-4">
                Select file
              </span>
              <input
                type="file"
                id="stlFileInput"
                accept=".stl"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="text-sm text-zinc-600 dark:text-[#bdbdbd]">
                <p className="mb-2">Accepted formats: <strong>.STL</strong></p>
                <p>Max size 200MB.</p>
              </div>
            </label>

            {fileName && <p className="text-sm text-zinc-800 dark:text-[#f4f1e8] mb-3">Selected file: <strong>{fileName}</strong></p>}
            {error && <p className="text-sm text-red-600 dark:text-red-300 mb-3">{error}</p>}

            {price !== null && (
              <div id="stlResultBox" className="space-y-3 mb-6 p-4 border border-black/10 dark:border-white/10 rounded-xl bg-black/5 dark:bg-white/5">
                <p className="text-sm text-zinc-700 dark:text-[#d8c6a8]">Estimated Volume: {volumeCm3?.toFixed(2)} cm³</p>
                <p className="text-sm text-zinc-700 dark:text-[#d8c6a8]">Estimated Weight: {weightGrams?.toFixed(1)} grams</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-[#b995ff] font-retro">Estimated Price: ₹{price}</p>
              </div>
            )}

            <Link 
              to="/contact" 
              className="text-center border-2 border-black bg-[#E6DDF2] hover:bg-[#d5cbe3] dark:bg-[#b995ff] dark:text-[#000000] text-black px-6 py-3 rounded font-retro text-xs font-bold transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Send For Final Quote
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
