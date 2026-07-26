const IS_PROD = true;

const CASHFREE_BASE_URL = IS_PROD
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const CLIENT_ID = process.env.CASHFREE_APP_ID || '13004828759f4aa002bfefde4482840031';
const CLIENT_SECRET = process.env.CASHFREE_SECRET_KEY || 'cfsk_ma_prod_72d7de80c99f14da1353233f3ff903f2_1b92b30c';

// Your actual production domain
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sd-studio-two.vercel.app';

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  payment_session_id: string;
  order_status: string;
  order_amount: number;
  order_currency: string;
}

export async function createCashfreeOrder(payload: {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<{ data?: CashfreeOrderResponse; error?: string }> {
  try {
    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CLIENT_ID,
        'x-client-secret': CLIENT_SECRET,
      },
      body: JSON.stringify({
        order_id: payload.orderId,
        order_amount: payload.orderAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: payload.customerEmail.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 45),
          customer_name: payload.customerName,
          customer_email: payload.customerEmail,
          customer_phone: payload.customerPhone.replace(/[^0-9]/g, '').slice(-10),
        },
        order_meta: {
          // Using your actual production domain for the return URL
          return_url: `${FRONTEND_URL}/order-success?order_id={order_id}`,
        },
      }),
    });

    const data = await response.json() as any;
    if (!response.ok) {
      console.error('Cashfree API Error Body:', data);
      return { error: data.message || data.error_code || 'API Error' };
    }

    return { data: data as CashfreeOrderResponse };
  } catch (error: any) {
    console.error('Cashfree Exception:', error);
    return { error: 'Backend logic failed' };
  }
}

export async function getCashfreeOrder(orderId: string) {
  try {
    const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': CLIENT_ID,
        'x-client-secret': CLIENT_SECRET,
      },
    });

    const data = await response.json();
    return response.ok ? data : null;
  } catch (error) {
    console.error('Cashfree API Exception:', error);
    return null;
  }
}
