import { motion } from 'motion/react';
import { CheckCircle2, Clock, Zap, Truck, Package } from 'lucide-react';

interface ProductionTimelineProps {
  productionTime?: string;
  madeToOrder?: boolean;
  status?: 'pending' | 'printing' | 'quality-check' | 'shipping' | 'delivered';
}

export default function ProductionTimeline({ 
  productionTime = 'Ships within 3-5 days',
  madeToOrder = true,
  status = 'pending'
}: ProductionTimelineProps) {
  const stages = [
    { id: 'order', label: 'Order Placed', icon: Package, time: 'Immediately' },
    { id: 'print', label: 'Printing Starts', icon: Zap, time: productionTime },
    { id: 'check', label: 'Quality Check', icon: CheckCircle2, time: '1-2 days' },
    { id: 'ship', label: 'In Transit', icon: Truck, time: '2-4 days' },
  ];

  const statusMap: Record<string, number> = {
    pending: 0,
    printing: 1,
    'quality-check': 2,
    shipping: 3,
    delivered: 4
  };

  const currentStage = statusMap[status] || 0;

  if (!madeToOrder) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-semibold text-sm text-green-900 dark:text-green-100">
              In Stock & Ready to Ship
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Dispatches within 24 hours
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Production Timeline
        </h3>
      </div>

      {/* Timeline Stages */}
      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = idx === currentStage;
          const isCompleted = idx < currentStage;
          
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex gap-4"
            >
              {/* Connector Line */}
              {idx < stages.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-12 bg-gradient-to-b from-zinc-300 to-zinc-100 dark:from-zinc-600 dark:to-zinc-800" />
              )}

              {/* Stage Icon */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted || isActive
                      ? 'bg-primary text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              </div>

              {/* Stage Info */}
              <div className="flex-1 pt-1">
                <p className={`font-semibold text-sm ${
                  isCompleted || isActive
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}>
                  {stage.label}
                </p>
                <p className={`text-xs mt-1 ${
                  isCompleted || isActive
                    ? 'text-zinc-600 dark:text-zinc-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}>
                  {stage.time}
                </p>
              </div>

              {/* Status Badge */}
              {isActive && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded"
                >
                  Current
                </motion.div>
              )}
              {isCompleted && (
                <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                  Done
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Important Note */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
          <strong>Note:</strong> Each item is custom-printed on demand. Production timelines are estimates and may vary based on design complexity and current order volume. You'll receive email updates at each stage.
        </p>
      </div>
    </div>
  );
}
