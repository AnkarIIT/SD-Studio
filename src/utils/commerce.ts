import { CartItem } from '../types';

export const FREE_SHIPPING_THRESHOLD = 5000;
export const STANDARD_SHIPPING = 99;
export const GST_RATE = 0.18;

export const COUPONS: Record<string, { label: string; percent: number }> = {
  LB_FIRST_10: { label: 'First order discount', percent: 10 },
  LAB15: { label: 'Lab community discount', percent: 15 },
  NEWSLETTER15: { label: 'Newsletter signup discount', percent: 15 },
};

export const getCartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const getDiscount = (
  subtotal: number,
  couponCode?: string,
  coupons: Record<string, { label: string; percent: number }> = COUPONS
) => {
  const coupon = couponCode ? coupons[couponCode.trim().toUpperCase()] : undefined;
  return coupon ? Math.round(subtotal * (coupon.percent / 100)) : 0;
};

export const getOrderTotals = (
  items: CartItem[],
  couponCode?: string,
  options?: {
    freeShippingThreshold?: number;
    coupons?: Record<string, { label: string; percent: number }>;
  }
) => {
  const threshold = options?.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;
  const coupons = options?.coupons ?? COUPONS;
  const subtotal = getCartSubtotal(items);
  const discount = getDiscount(subtotal, couponCode, coupons);
  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = Math.round(taxableAmount * GST_RATE);
  const shipping = subtotal > 0 && taxableAmount < threshold ? STANDARD_SHIPPING : 0;
  const total = taxableAmount + tax + shipping;

  return { subtotal, discount, tax, shipping, total };
};

export const isValidCoupon = (
  couponCode: string,
  coupons: Record<string, { label: string; percent: number }> = COUPONS
) => Boolean(coupons[couponCode.trim().toUpperCase()]);
