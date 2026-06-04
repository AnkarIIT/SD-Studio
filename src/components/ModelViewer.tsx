import { motion } from 'motion/react';
import { Package } from 'lucide-react';

interface ModelViewerProps {
  modelUrl?: string;
  productName: string;
}

export default function ModelViewer({ modelUrl, productName }: ModelViewerProps) {
  if (!modelUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-8 flex flex-col items-center justify-center min-h-[400px]"
      >
        <Package className="w-12 h-12 text-zinc-400 mb-4" />
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">3D preview</h3>
        <p className="text-sm text-zinc-500 text-center max-w-md">
          GLB model coming soon for {productName}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
      <model-viewer
        src={modelUrl}
        alt={`3D model of ${productName}`}
        auto-rotate
        camera-controls
        touch-action="pan-y"
        style={{ width: '100%', height: '420px', background: '#f4f4f5' }}
      />
      <p className="text-xs text-zinc-500 p-3 text-center">Drag to rotate · Scroll to zoom</p>
    </motion.div>
  );
}