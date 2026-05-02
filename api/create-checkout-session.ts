import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27-ac', // Use latest stable
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, customerEmail, orderId, metadata } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.title,
            description: item.description || 'Premium 3D Print',
          },
          unit_amount: Math.round(parseInt(String(item.price).replace(/\D/g, ''), 10) * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
      cancel_url: `${req.headers.origin}/checkout`,
      customer_email: customerEmail,
      metadata: {
        orderId,
        ...metadata
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    res.status(400).json({ error: error.message });
  }
}
