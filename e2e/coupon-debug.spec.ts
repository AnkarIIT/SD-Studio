import { test } from '@playwright/test';

test('coupon applies in checkout', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + String(e)));

  const resp = await page.request.get('http://localhost:3000/api/products');
  const data = await resp.json();
  const p = data.products.find((x: any) => x.id === 'cms1noqf10006viuw62mk9lyc') || data.products[0];
  console.log('using product:', p.name, p.price);

  const cartItem = { ...p, quantity: 1 };
  await page.addInitScript((item) => {
    localStorage.setItem('cart-storage', JSON.stringify({ state: { items: [item] }, version: 0 }));
    localStorage.setItem('sd-checkout-address', JSON.stringify({
      fullName: 'Test User', email: 'test@example.com', phone: '9876543210',
      street: '1 Main St', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India',
    }));
  }, cartItem);

  await page.goto('http://localhost:3000/?cart=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const checkoutBtn = page.getByRole('button', { name: /Proceed to Checkout/i });
  await checkoutBtn.waitFor({ state: 'visible', timeout: 20000 });
  console.log('cart has item + checkout btn visible');
  await checkoutBtn.click();
  await page.waitForTimeout(1200);

  const couponInput = page.getByPlaceholder('Coupon');
  await couponInput.waitFor({ state: 'visible', timeout: 20000 });
  console.log('checkout + coupon input visible');

  async function apply(code: string) {
    await couponInput.fill(code);
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.waitForTimeout(900);
    const aside = await page.locator('aside').innerText();
    const toasts = await page.locator('[role="status"]').allInnerTexts();
    console.log(`--- after ${code} ---`);
    console.log(aside.replace(/\n/g, ' | '));
    console.log('toasts:', JSON.stringify(toasts));
  }

  await apply('SD_FIRST_10');
  await apply('3DBYSDFUCK');
  await apply('SURYA_FUCKER');
  await apply('INVALIDCODE');

  console.log('ERRORS:', JSON.stringify(errors));
});
