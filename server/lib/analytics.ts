import prisma from './database';

export async function getStoreAnalytics() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const paidStatuses = new Set(['paid', 'confirmed', 'shipped', 'delivered']);
  const paid = orders.filter((o) => paidStatuses.has(o.status));

  const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
  const avgOrder = paid.length ? revenue / paid.length : 0;

  const byStatus: Record<string, number> = {};
  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  }

  const last7Days: Array<{ date: string; orders: number; revenue: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = paid.filter((o) => o.createdAt.toISOString().slice(0, 10) === key);
    last7Days.push({
      date: key,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
    });
  }

  return {
    totalOrders: orders.length,
    paidOrders: paid.length,
    revenue: Math.round(revenue),
    avgOrderValue: Math.round(avgOrder),
    byStatus,
    last7Days,
  };
}