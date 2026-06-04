import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';
import { fetchOrderTimeline, type TimelineEvent } from '../utils/ordersApi';
import { fetchAdminOrderTimeline } from '../utils/adminApi';

const STAGE_ORDER = [
  'order_placed',
  'payment_received',
  'production_started',
  'quality_check',
  'shipped',
  'delivered',
];

interface OrderTimelineProps {
  orderId: string;
  admin?: boolean;
}

export default function OrderTimeline({ orderId, admin = false }: OrderTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const loader = admin ? fetchAdminOrderTimeline(orderId) : fetchOrderTimeline(orderId);
    loader
      .then((res) => setEvents(res.timeline))
      .finally(() => setLoading(false));
  }, [orderId, admin]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading timeline…
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-xs text-zinc-400 py-2">Timeline will appear after server sync.</p>;
  }

  const doneStages = new Set(events.map((e) => e.stage));

  return (
    <ul className="mt-3 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
      {STAGE_ORDER.map((stage) => {
        const event = events.find((e) => e.stage === stage);
        const done = doneStages.has(stage);
        return (
          <li key={stage} className="flex items-start gap-2 text-xs">
            {done ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0 mt-0.5" />
            )}
            <span className={done ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400'}>
              {event?.label ?? stage.replace(/_/g, ' ')}
              {event?.message && (
                <span className="block text-[10px] text-zinc-400 mt-0.5">{event.message}</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}