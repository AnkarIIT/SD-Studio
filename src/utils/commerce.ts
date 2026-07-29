import { CartItem } from '../types';

export const FREE_SHIPPING_THRESHOLD = 0; // Enforce shipping for everyone if threshold is 0 and logic uses it
export const STANDARD_SHIPPING = 249;
export const GST_RATE = 0; // Tax removed

export const COUPONS: Record<string, { label: string; percent: number }> = {
  SD_FIRST_10: { label: 'First order discount', percent: 10 },
  SD_LAB15: { label: 'Lab community discount', percent: 15 },
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
  // const threshold = options?.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;
  const coupons = options?.coupons ?? COUPONS;
  const subtotal = getCartSubtotal(items);
  const discount = getDiscount(subtotal, couponCode, coupons);
  const discountedAmount = Math.max(subtotal - discount, 0);

  // Tax removed
  const tax = 0;

  // Enforced shipping cost
  const shipping = subtotal > 0 ? STANDARD_SHIPPING : 0;

  const total = discountedAmount + tax + shipping;

  return { subtotal, discount, tax, shipping, total };
};

export const isValidCoupon = (
  couponCode: string,
  coupons: Record<string, { label: string; percent: number }> = COUPONS
) => Boolean(coupons[couponCode.trim().toUpperCase()]);
