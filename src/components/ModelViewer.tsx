import { motion } from 'motion/react';
import { Maximize2, Package, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ModelViewerProps {
  modelUrl?: string;
  productName: string;
}

export default function ModelViewer({ modelUrl, productName }: ModelViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If no model URL is provided, show placeholder
  if (!modelUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-8 flex flex-col items-center justify-center min-h-[400px]"
      >
        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">3D Model View</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center max-w-md">
          Rotate, zoom, and inspect every angle of {productName} with our interactive 3D viewer
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-4 italic">
          Model file will be available soon
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="relative bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden min-h-[400px] flex items-center justify-center group">
        
        {/* Info Banner */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-zinc-950/50 to-transparent p-4 z-10">
          <div className="flex items-start gap-2 text-white">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-xs font-medium">
              Use your mouse to rotate, scroll to zoom
            </span>
          </div>
        </div>

        {/* Placeholder for 3D Model */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <Package className="w-12 h-12 text-primary opacity-40" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              3D Model Ready
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              Powered by Three.js
            </p>
          </div>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg p-2 transition-all z-20 opacity-0 group-hover:opacity-100"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Controls Info */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-2">
          <p className="text-zinc-600 dark:text-zinc-400">Left Click</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Rotate</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-2">
          <p className="text-zinc-600 dark:text-zinc-400">Scroll</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Zoom</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-2">
          <p className="text-zinc-600 dark:text-zinc-400">Right Click</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Pan</p>
        </div>
      </div>
    </motion.div>
  );
}
