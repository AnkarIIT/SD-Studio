/**
 * SD Studios concierge: rule-based help + optional Gemini (VITE_GEMINI_API_KEY).
 */

export interface ConciergeContext {
  contactEmail: string;
  instagramUrl: string;
  heroSubtitle?: string;
}

const SITE = 'SD Studios';

function localReply(text: string, ctx: ConciergeContext): string {
  const t = text.toLowerCase().trim();

  if (/^(hi|hello|hey|namaste|hii)\b/.test(t)) {
    return `Hi! Welcome to ${SITE}. I can point you to the shop, order tracking, custom 3D quotes, or contact options. What do you need?`;
  }

  if (/shop|buy|product|collection|catalog|price/i.test(t)) {
    return `Browse ready-made prints and prices on the Shop page. Add items to the cart, then checkout with secure online payment (INR). For something unique, use Request to upload a model and get a quote.`;
  }

  if (/track|order id|where is my|delivery|ship|status/i.test(t)) {
    return `Open Track and enter the Order ID from your confirmation (after payment or on your receipt). You will see print and shipping status there.`;
  }

  if (/custom|stl|quote|model|print my|upload/i.test(t)) {
    return `Open Request, upload your .STL file, pick material (PLA, PETG, or TPU), and we will estimate weight and price. Submit when you are happy—we will follow up on your request.`;
  }

  if (/pay|payment|razorpay|refund|cod/i.test(t)) {
    return `Checkout uses Razorpay for cards and UPI in INR. After payment your order is saved. For refunds or payment issues, email ${ctx.contactEmail} with your Order ID and payment reference.`;
  }

  if (/contact|email|reach|whatsapp|instagram|social/i.test(t)) {
    return `Use the Say Hello form on the homepage, email ${ctx.contactEmail}, or find us on Instagram: ${ctx.instagramUrl}`;
  }

  if (/material|pla|petg|tpu|quality/i.test(t)) {
    return `We offer PLA (great for decor), PETG (tougher, smoother), and TPU (flexible). On products you can pick options where applicable; custom jobs choose material on the Request page.`;
  }

  if (/ship|shipping|deliver|pincode|address/i.test(t)) {
    return `Enter your full address at checkout. Shipping appears in your order summary; we fulfil from India. Use Track for updates after you order.`;
  }

  if (/admin|wholesale|bulk|business/i.test(t)) {
    return `For bulk or business enquiries, email ${ctx.contactEmail} with quantity and timeline.`;
  }

  return `I can help with ${SITE}: shopping, custom 3D prints, order tracking, and how to reach us. Try: shop, track my order, custom quote, or contact email. Or use Shop, Track, and Request in the menu.`;
}

async function geminiReply(userText: string, ctx: ConciergeContext): Promise<string | null> {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key?.trim()) return null;

  const system = `You are the concise, friendly chat assistant for ${SITE}, a premium 3D printing studio in India (INR, Razorpay). 
Rules: Only answer about this shop—products, custom prints, materials (PLA/PETG/TPU), orders, tracking with Order ID, checkout, contact (${ctx.contactEmail}), Instagram (${ctx.instagramUrl}). 
Keep answers under 120 words. Use plain text, no markdown headers. If unsure, tell them to email ${ctx.contactEmail}.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: userText }] }],
        }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const out = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')?.trim();
    return out || null;
  } catch {
    return null;
  }
}

export async function getConciergeReply(userText: string, ctx: ConciergeContext): Promise<string> {
  const trimmed = userText.trim();
  if (!trimmed) return localReply('help', ctx);

  const ai = await geminiReply(trimmed, ctx);
  if (ai) return ai;
  return localReply(trimmed, ctx);
}
