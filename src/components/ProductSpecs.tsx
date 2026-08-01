import { motion } from 'motion/react';
import { Layers, Zap, Wrench, ShieldCheck } from 'lucide-react';
import { Product, ProductSpecifications } from '../types';

interface ProductSpecsProps {
  product: Product;
}

const LEGACY_DURABILITY_INFO: Record<string, { label: string; description: string; color: string }> = {
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

const DEFAULT_MTO_NOTE = 'Each item is custom-printed for you. Ships within 3-5 days';
const DEFAULT_NOTE =
  '3D printed items may display slight layer lines and color variations, which are inherent to the manufacturing process and not defects. Each print is a unique creation with its own character.';
const DEFAULT_SPEC_ROWS: { label: string; value: string }[] = [
  { label: 'Material', value: 'PLA' },
  { label: 'Dimensions', value: 'Varies by design' },
  { label: 'Print Time', value: 'Varies by size' },
  { label: 'Infill', value: '20%' },
  { label: 'Layer Height', value: '0.2mm' },
  { label: 'Support Material', value: 'Yes' },
];

function collectSpecRows(product: Product): { label: string; value: string }[] {
  const spec = product.specifications;
  if (spec && Array.isArray(spec.specs) && spec.specs.length) {
    const rows = spec.specs.filter(
      (r): r is { label: string; value: string } =>
        !!r && typeof r.label === 'string' && typeof r.value === 'string' && r.value.trim().length > 0
    );
    if (rows.length) return rows;
  }

  const legacy = product.specs;
  if (legacy) {
    const rows: { label: string; value: string }[] = [
      { label: 'Material', value: legacy.material },
      { label: 'Dimensions', value: legacy.dimensions },
      { label: 'Print Time', value: legacy.printTime },
      ...(legacy.infill ? [{ label: 'Infill', value: legacy.infill }] : []),
      ...(legacy.layerHeight ? [{ label: 'Layer Height', value: legacy.layerHeight }] : []),
      ...(legacy.supportRequired !== undefined
        ? [{ label: 'Support Material', value: legacy.supportRequired ? 'Yes' : 'No' }]
        : []),
    ].filter((r) => !!r.value);
    if (rows.length) return rows;
  }

  return DEFAULT_SPEC_ROWS;
}

export default function ProductSpecs({ product }: ProductSpecsProps) {
  const spec = product.specifications as ProductSpecifications | undefined;

  const madeToOrder = spec?.madeToOrder ?? product.madeToOrder ?? true;
  const madeToOrderNote =
    spec?.madeToOrderNote || `Each item is custom-printed for you. ${product.productionTime || 'Ships within 3-5 days'}`;

  const specRows = collectSpecRows(product);

  let durability: { label: string; description: string; color: string } | null = null;
  if (spec?.usageLabel || spec?.usageDescription) {
    durability = {
      label: spec.usageLabel || 'Durability',
      description: spec.usageDescription || '',
      color: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
    };
  } else if (product.durabilityRating) {
    const info = LEGACY_DURABILITY_INFO[product.durabilityRating];
    if (info) durability = info;
  }

  const note = spec?.note || DEFAULT_NOTE;

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
              {madeToOrderNote}
            </p>
          </div>
        </motion.div>
      )}

      {/* Technical Specifications */}
      {specRows.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Technical Specifications
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {specRows.map((row, idx) => (
              <div key={`${row.label}-${idx}`}>
                <p className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1">{row.label}</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.value}</p>
              </div>
            ))}
          </div>

          {/* Print Note / Disclaimer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Note:</strong> {note}
            </p>
          </div>
        </div>
      )}

      {/* Durability */}
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
              {durability.description && (
                <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
                  {durability.description}
                </p>
              )}
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
