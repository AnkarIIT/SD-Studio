import { CartItem } from '../types';

export const STANDARD_SHIPPING = 249;

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
    coupons?: Record<string, { label: string; percent: number }>;
  }
) => {
  const coupons = options?.coupons ?? COUPONS;
  const subtotal = getCartSubtotal(items);
  const discount = getDiscount(subtotal, couponCode, coupons);
  const discountedAmount = Math.max(subtotal - discount, 0);

  const tax = 0;

  const shipping = subtotal > 0 ? STANDARD_SHIPPING : 0;

  const total = discountedAmount + tax + shipping;

  return { subtotal, discount, tax, shipping, total };
};

export const isValidCoupon = (
  couponCode: string,
  coupons: Record<string, { label: string; percent: number }> = COUPONS
) => Boolean(coupons[couponCode.trim().toUpperCase()]);
