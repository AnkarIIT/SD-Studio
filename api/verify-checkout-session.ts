import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27-ac',
});

export default async function handler(req: any, res: any) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.status(200).json({ status: session.payment_status, metadata: session.metadata });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
