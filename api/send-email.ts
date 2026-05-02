import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'SD Studios <onboarding@resend.dev>', // Update this to your verified domain later
      to,
      subject,
      html,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
}
