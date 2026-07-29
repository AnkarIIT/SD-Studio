import prisma from './database';
import { auditRepo } from './database';

export const TIMELINE_STAGES = [
  'order_placed',
  'payment_received',
  'production_started',
  'quality_check',
  'shipped',
  'delivered',
] as const;

export type TimelineStage = (typeof TIMELINE_STAGES)[number];

const STAGE_LABELS: Record<TimelineStage, string> = {
  order_placed: 'Order placed',
  payment_received: 'Payment received',
  production_started: 'Production started',
  quality_check: 'Quality check',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

export function stageLabel(stage: string): string {
  return STAGE_LABELS[stage as TimelineStage] ?? stage;
}

export async function addTimelineEvent(
  orderId: string,
  stage: TimelineStage,
  message?: string
) {
  const event = await prisma.orderTimelineEvent.upsert({
    where: { orderId_stage: { orderId, stage } },
    create: { orderId, stage, message },
    update: {},
  });

  await auditRepo.log('order', orderId, 'timeline', { stage, message });
  return event;
}

export async function getOrderTimeline(orderId: string) {
  const events = await prisma.orderTimelineEvent.findMany({
    where: { orderId },
    orderBy: { createdAt: 'asc' },
  });

  return events.map((e) => ({
    id: e.id,
    orderId: e.orderId,
    stage: e.stage,
    label: stageLabel(e.stage),
    message: e.message,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function seedInitialTimeline(orderId: string) {
  await addTimelineEvent(orderId, 'order_placed', 'Your order was received');
}
