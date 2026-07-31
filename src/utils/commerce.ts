import { CartItem } from '../types';

export const STANDARD_SHIPPING = 249;

export interface CouponEntry {
  label?: string;
  percent?: number;
  type?: 'Percentage' | 'Fixed Amount';
  value?: number;
  minOrderValue?: number;
  expiryDate?: string;
  usageLimit?: number;
  timesUsed?: number;
  status?: string;
}

export type CouponMap = Record<string, CouponEntry>;

export const COUPONS: CouponMap = {
  SD_FIRST_10: { label: 'First order discount', percent: 10 },
  SD_LAB15: { label: 'Lab community discount', percent: 15 },
  NEWSLETTER15: { label: 'Newsletter signup discount', percent: 15 },
};

export const getCartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

// Returns a reason the coupon can't be used, or null if it can.
export const couponIssue = (coupon: CouponEntry | undefined, subtotal: number): string | null => {
  if (!coupon) return 'Invalid coupon code';
  const status = coupon.status;
  if (status && status !== 'Active') return 'This coupon is no longer active';
  if (coupon.expiryDate) {
    const expiry = new Date(`${coupon.expiryDate}T23:59:59`);
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return 'This coupon has expired';
    }
  }
  const min = Number(coupon.minOrderValue) || 0;
  if (min > 0 && subtotal < min) {
    return `Minimum order of ₹${min} required`;
  }
  const limit = Number(coupon.usageLimit) || 0;
  const used = Number(coupon.timesUsed) || 0;
  if (limit > 0 && used >= limit) {
    return 'This coupon has reached its usage limit';
  }
  return null;
};

export const couponDiscount = (coupon: CouponEntry | undefined, subtotal: number): number => {
  if (!coupon || couponIssue(coupon, subtotal)) return 0;
  if (coupon.type === 'Fixed Amount') {
    return Math.min(Number(coupon.value) || 0, subtotal);
  }
  const pct = Number(coupon.percent != null ? coupon.percent : coupon.value) || 0;
  return Math.round(subtotal * pct) / 100;
};

export const getDiscount = (
  subtotal: number,
  couponCode?: string,
  coupons: CouponMap = COUPONS
) => {
  const coupon = couponCode ? coupons[couponCode.trim().toUpperCase()] : undefined;
  return Math.round(couponDiscount(coupon, subtotal) * 100) / 100;
};

export const getOrderTotals = (
  items: CartItem[],
  couponCode?: string,
  options?: {
    coupons?: CouponMap;
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
  coupons: CouponMap = COUPONS,
  subtotal = 0
) => couponIssue(coupons[couponCode.trim().toUpperCase()], subtotal) === null;
