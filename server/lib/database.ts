import { PrismaClient } from '@prisma/client';

// Instantiate Prisma Client
const prisma = new PrismaClient();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔴 Shutting down database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;

/**
 * Payment Repository Functions
 */
export const paymentRepo = {
  // Create a new payment record
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
  },

  // Update payment status
  updateStatus: async (
    paymentId: string,
    status: string,
    reference?: string
  ) => {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: status,
        ...(reference && { paymentReference: reference }),
        ...(status === 'success' && { completedAt: new Date() }),
      },
    });
  },

  // Find payment by order ID
  findByOrderId: async (orderId: string) => {
    return prisma.payment.findUnique({
      where: { orderId },
    });
  },

  // Get all payments (with pagination)
  getAll: async (skip: number = 0, take: number = 10) => {
    return prisma.payment.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get payments by status
  getByStatus: async (status: string) => {
    return prisma.payment.findMany({
      where: { paymentStatus: status },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get payment statistics
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

/**
 * Delivery Repository Functions
 */
export const deliveryRepo = {
  // Create a new delivery record
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
  },

  // Update delivery status
  updateStatus: async (
    deliveryId: string,
    status: string,
    tracking?: string
  ) => {
    const updates: any = { status };

    if (tracking) updates.trackingNumber = tracking;
    if (status === 'shipped') updates.shippedAt = new Date();
    if (status === 'delivered') updates.deliveredAt = new Date();

    return prisma.delivery.update({
      where: { id: deliveryId },
      data: updates,
    });
  },

  // Find delivery by order ID
  findByOrderId: async (orderId: string) => {
    return prisma.delivery.findUnique({
      where: { orderId },
      include: { payment: true },
    });
  },

  // Get all deliveries (with pagination)
  getAll: async (skip: number = 0, take: number = 10) => {
    return prisma.delivery.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { payment: true },
    });
  },

  // Get deliveries by status
  getByStatus: async (status: string) => {
    return prisma.delivery.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { payment: true },
    });
  },

  // Get delivery statistics
  getStats: async () => {
    return prisma.delivery.groupBy({
      by: ['status'],
      _count: true,
    });
  },
};

/**
 * Cleanup Functions (for cron jobs)
 */
export const cleanupRepo = {
  // Delete old expired payments (successful or failed > 30 days old)
  deleteOldPayments: async () => {
    const result = await prisma.payment.deleteMany({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          {
            OR: [
              { paymentStatus: 'success' },
              { paymentStatus: 'failed' },
              { paymentStatus: 'refunded' },
            ],
          },
        ],
      },
    });
    return result;
  },

  // Delete old expired deliveries (delivered > 30 days old)
  deleteOldDeliveries: async () => {
    const result = await prisma.delivery.deleteMany({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          { status: 'delivered' },
        ],
      },
    });
    return result;
  },

  // Delete old cancelled orders
  deleteOldCancelledOrders: async () => {
    const result = await prisma.payment.deleteMany({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          { paymentStatus: 'cancelled' },
        ],
      },
    });
    return result;
  },

  // Archive old orders instead of deleting (optional)
  archiveOldOrders: async () => {
    // This would require an Archive table
    // For now, just deletes
    return { archived: 0 };
  },

  // Run all cleanup tasks
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

/**
 * Audit Log Functions
 */
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
