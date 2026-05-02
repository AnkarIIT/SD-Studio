export const sendOrderConfirmation = async (email: string, orderId: string, customerName: string, total: string, queuePosition?: number) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: `Order Secured: #${orderId.toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #8b5cf6; text-transform: uppercase; letter-spacing: 2px;">Order Secured!</h1>
            <p>Hello ${customerName},</p>
            <p>Your payment was successful and your gear is now in the manufacturing queue.</p>
            
            ${queuePosition ? `
            <div style="background: #8b5cf6; color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Manufacturing Queue Position</p>
              <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 32px;">#${queuePosition}</p>
              <p style="margin: 10px 0 0 0; font-size: 11px; opacity: 0.8;">Orders ahead of you: ${queuePosition - 1}</p>
            </div>
            ` : ''}

            <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Order Reference</p>
              <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px; color: #8b5cf6;">#${orderId.toUpperCase()}</p>
            </div>
            <p>Total Amount Paid: <strong>₹${total}</strong></p>
            <p>You can track your manufacturing progress here: <a href="${window.location.origin}/track?id=${orderId}" style="color: #8b5cf6; text-decoration: none; font-weight: bold;">Track Order</a></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #9ca3af;">Thank you for choosing SD Studios. Designed for dreamers.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return null;
  }
};
