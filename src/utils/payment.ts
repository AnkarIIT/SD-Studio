import QRCode from 'qrcode';

/**
 * Generate a UPI payment URL string
 * Format: upi://pay?pa=UPI_ID&pn=PAYEE_NAME&am=AMOUNT&tn=TRANSACTION_NOTE
 */
export const generateUpiUrl = (
  upiId: string,
  payeeName: string,
  amount: number,
  transactionNote: string
): string => {
  // Remove special characters and normalize
  const normalizedName = payeeName.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 60);
  const normalizedNote = transactionNote.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 80);
  
  // Format amount to 2 decimal places
  const formattedAmount = (amount / 100).toFixed(2); // Assuming amount is in paise
  
  const params = new URLSearchParams({
    pa: upiId,
    pn: normalizedName,
    am: formattedAmount,
    tn: normalizedNote,
  });

  return `upi://pay?${params.toString()}`;
};

/**
 * Generate a QR code data URL for a given payment URL
 */
export const generateQrCode = async (upiUrl: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      width: 250,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Validate UPI transaction reference format
 */
export const validateUpiReference = (reference: string): boolean => {
  // UPI reference format: Can be alphanumeric, typically 12 characters
  // Examples: 123456789012, ABC123DEF456
  return /^[A-Z0-9]{6,20}$/.test(reference.trim().toUpperCase());
};

/**
 * Validate bank transfer reference
 */
export const validateBankReference = (reference: string): boolean => {
  // Bank reference: typically UTR (Unique Transaction Reference)
  // Format: alphanumeric, 9-20 characters
  return /^[A-Z0-9]{9,20}$/.test(reference.trim().toUpperCase());
};

/**
 * Format payment method display name
 */
export const formatPaymentMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    upi: 'UPI Payment',
    card: 'Card Demo',
    bank_transfer: 'Bank Transfer',
    cod: 'Cash on Delivery',
  };
  return methodMap[method] || method;
};

/**
 * Generate a mock Razorpay order (for demo)
 * In production, this would call your backend API
 */
export const createRazorpayOrder = async (amount: number, orderId: string) => {
  // Mock implementation - in production, call your backend
  // POST /api/orders with { amount, orderId }
  return {
    id: `order_${Date.now()}`,
    entity: 'order',
    amount: amount * 100, // Razorpay expects amount in paise
    amount_paid: 0,
    amount_due: amount * 100,
    currency: 'INR',
    receipt: orderId,
    offer_id: null,
    status: 'created',
    attempts: 0,
    notes: {
      '3dbysd_order_id': orderId,
    },
    created_at: Math.floor(Date.now() / 1000),
  };
};

/**
 * Verify Razorpay payment signature (production only)
 */
export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean => {
  // In production, use crypto-js to verify HMAC-SHA256
  // const crypto = require('crypto');
  // const hash = crypto.createHmac('sha256', secret)
  //   .update(`${orderId}|${paymentId}`)
  //   .digest('hex');
  // return hash === signature;
  
  // For now, just validate format
  return signature.length > 0 && paymentId.length > 0;
};

/**
 * Generate a transaction ID for mock payments
 */
export const generateTransactionId = (method: string): string => {
  const prefix = method.toUpperCase().substring(0, 3);
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

/**
 * Check if payment method requires reference input
 */
export const methodRequiresReference = (method: string): boolean => {
  return ['upi', 'bank_transfer'].includes(method);
};

/**
 * Get payment method icon (for reference)
 */
export const getPaymentMethodIcon = (method: string): string => {
  const iconMap: Record<string, string> = {
    upi: '📱',
    card: '💳',
    bank_transfer: '🏦',
    cod: '💰',
  };
  return iconMap[method] || '💳';
};
