/**
 * Phase 4 — Payment gateway: Razorpay Checkout (INR, client key `VITE_RAZORPAY_KEY_ID`).
 * Server-side payment verification (recommended for production) is not in this bundle.
 * Stripe: add a separate integration or backend if you need non-INR / global cards.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // If already loaded, resolve true
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
