import './env';
import { PrismaClient, PaymentStatus, DeliveryStatus } from '@prisma/client';

function createFallbackPrismaClient(): PrismaClient {
  return new Proxy({}, {
    get() {
      throw new Error('DATABASE_URL is not configured');
    },
  }) as PrismaClient;
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL?.trim()) {
    return createFallbackPrismaClient();
  }

  try {
    return new PrismaClient();
  } catch {
    return createFallbackPrismaClient();
  }
}

let prisma: PrismaClient;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

if (!process.env.VERCEL) {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  prisma = globalForPrisma.prisma;
} else {
  prisma = createPrismaClient();
}

if (!process.env.VERCEL) {
  process.on('SIGINT', async () => {
    console.log('\n🔴 Shutting down database connection...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default prisma;

export const paymentRepo = {
  create: async (data: {
    orderId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    amount: number;
    paymentMethod: string;
    paymentReference?: string;
    itemCount: number;
  }) => {
    return prisma.payment.create({
      data: {
        ...data,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  },

  updateStatus: async (
    paymentId: string,
    status: PaymentStatus,
    reference?: string
  ) => {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: status,
        ...(reference && { paymentReference: reference }),
        ...(status === PaymentStatus.success && { completedAt: new Date() }),
      },
    });
  },

  findByOrderId: async (orderId: string) => {
    return prisma.payment.findUnique({
      where: { orderId },
    });
  },

  getAll: async (skip: number = 0, take: number = 10) => {
    return prisma.payment.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  },

  getByStatus: async (status: PaymentStatus) => {
    return prisma.payment.findMany({
      where: { paymentStatus: status },
      orderBy: { createdAt: 'desc' },
    });
  },

  getStats: async () => {
    return prisma.payment.groupBy({
      by: ['paymentStatus'],
      _count: true,
      _sum: {
        amount: true,
      },
    });
  },
};

export const deliveryRepo = {
  create: async (data: {
    orderId: string;
    paymentId: string;
    customerName: string;
    customerPhone?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    estimatedDelivery?: Date;
  }) => {
    return prisma.delivery.create({
      data: {
        ...data,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  },

  updateStatus: async (
    deliveryId: string,
    status: DeliveryStatus,
    tracking?: string
  ) => {
    const updates: Record<string, any> = { status };

    if (tracking) updates.trackingNumber = tracking;
    if (status === DeliveryStatus.shipped) updates.shippedAt = new Date();
    if (status === DeliveryStatus.delivered) updates.deliveredAt = new Date();

    return prisma.delivery.update({
      where: { id: deliveryId },
      data: updates,
    });
  },

  findByOrderId: async (orderId: string) => {
    return prisma.delivery.findUnique({
      where: { orderId },
      include: { payment: true },
    });
  },

  getAll: async (skip: number = 0, take: number = 10) => {
    return prisma.delivery.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { payment: true },
    });
  },

  getByStatus: async (status: DeliveryStatus) => {
    return prisma.delivery.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { payment: true },
    });
  },

  getStats: async () => {
    return prisma.delivery.groupBy({
      by: ['status'],
      _count: true,
    });
  },
};

export const cleanupRepo = {
  deleteOldPayments: async () => {
    const result = await prisma.payment.deleteMany({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          {
            OR: [
              { paymentStatus: PaymentStatus.success },
              { paymentStatus: PaymentStatus.failed },
              { paymentStatus: PaymentStatus.refunded },
            ],
          },
        ],
      },
    });
    return result;
  },

  deleteOldDeliveries: async () => {
    const result = await prisma.delivery.deleteMany({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          { status: DeliveryStatus.delivered },
        ],
      },
    });
    return result;
  },

  deleteOldCancelledOrders: async () => {
    const result = await prisma.payment.deleteMany({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          { paymentStatus: PaymentStatus.cancelled },
        ],
      },
    });
    return result;
  },

  archiveOldOrders: async () => {
    return { archived: 0 };
  },

  runAllCleanups: async () => {
    console.log('🧹 Starting database cleanup...');
    try {
      const payments = await cleanupRepo.deleteOldPayments();
      console.log(`  ✅ Deleted ${payments.count} old payment records`);

      const deliveries = await cleanupRepo.deleteOldDeliveries();
      console.log(`  ✅ Deleted ${deliveries.count} old delivery records`);

      const cancelled = await cleanupRepo.deleteOldCancelledOrders();
      console.log(`  ✅ Deleted ${cancelled.count} cancelled orders`);

      const total = payments.count + deliveries.count + cancelled.count;
      console.log(`✨ Cleanup complete! Deleted ${total} total records`);

      return { success: true, total };
    } catch (error) {
      console.error('❌ Cleanup error:', error);
      return { success: false, error };
    }
  },
};

export const auditRepo = {
  log: async (entity: string, entityId: string, action: string, changes?: any) => {
    return prisma.auditLog.create({
      data: {
        entity,
        entityId,
        action,
        changes: changes ? JSON.stringify(changes) : null,
      },
    });
  },

  getLogs: async (entityId: string) => {
    return prisma.auditLog.findMany({
      where: { entityId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
