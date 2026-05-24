import { motion } from 'motion/react';
import { Layers, Zap, Clock, Wrench, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface ProductSpecsProps {
  product: Product;
}

const DURABILITY_INFO = {
  'display-only': {
    label: 'Display Only',
    description: 'Decorative items - not for functional use',
    color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
  },
  'light-use': {
    label: 'Light Use',
    description: 'Occasional handling - not impact resistant',
    color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
  },
  'moderate-use': {
    label: 'Moderate Use',
    description: 'Regular use - holds up to daily handling',
    color: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
  },
  'heavy-use': {
    label: 'Heavy Duty',
    description: 'Professional grade - engineered for demanding use',
    color: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
  }
};

export default function ProductSpecs({ product }: ProductSpecsProps) {
  if (!product.specs) return null;

  const specs = product.specs;
  const durability = product.durabilityRating ? DURABILITY_INFO[product.durabilityRating] : null;
  const madeToOrder = product.madeToOrder !== false;

  return (
    <div className="space-y-6">
      {/* Made to Order Banner */}
      {madeToOrder && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-4 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              ✓ Made to Order
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Each item is custom-printed for you. {product.productionTime || 'Ships within 3-5 days'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Technical Specifications */}
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          Technical Specifications
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Material */}
          <div>
            <p className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1">Material</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{specs.material}</p>
          </div>

          {/* Dimensions */}
          <div>
            <p className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1">Dimensions</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{specs.dimensions}</p>
          </div>

          {/* Print Time */}
          <div>
            <p className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Print Time
            </p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{specs.printTime}</p>
          </div>

          {/* Infill */}
          {specs.infill && (
            <div>
              <p className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1">Infill</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{specs.infill}</p>
            </div>
          )}

          {/* Layer Height */}
          {specs.layerHeight && (
            <div>
              <p className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1">Layer Height</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{specs.layerHeight}</p>
            </div>
          )}

          {/* Support Required */}
          {specs.supportRequired !== undefined && (
            <div>
              <p className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1">Support Material</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {specs.supportRequired ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>

        {/* Quality Notice */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <strong>Note:</strong> 3D printed items may display slight layer lines and color variations, which are inherent to the manufacturing process and not defects. Each print is a unique creation with its own character.
          </p>
        </div>
      </div>

      {/* Durability Rating */}
      {durability && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-4 ${durability.color}`}
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-current opacity-70" />
            <div>
              <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {durability.label}
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
                {durability.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Material Swatches */}
      {product.materialSwatches && product.materialSwatches.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4" />
            Available Materials
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {product.materialSwatches.map((swatch, idx) => (
              <div key={idx} className="text-center">
                <div 
                  className="w-full h-20 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 mb-2 bg-gradient-to-br"
                  style={{
                    backgroundImage: `url(${swatch})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium truncate">
                  Variant {idx + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
