import { BRAND_NAME, BRAND_INSTAGRAM_URL, BRAND_INSTAGRAM_HANDLE, BRAND_SUPPORT_EMAIL } from './brand';

export type ContentSlug =
  | 'about'
  | 'privacy'
  | 'terms'
  | 'shipping'
  | 'returns'
  | 'contact';

export const CONTENT_PAGES: Record<
  ContentSlug,
  { title: string; subtitle: string; sections: Array<{ heading: string; body: string }> }
> = {
  about: {
    title: `About ${BRAND_NAME}`,
    subtitle: 'Premium made-to-order 3D prints from our lab in India',
    sections: [
      {
        heading: 'Our mission',
        body: `${BRAND_NAME} designs and fabricates premium 3D-printed objects for home, desk, and collectibles — with transparent production timelines and honest material specs.`,
      },
      {
        heading: 'How we print',
        body: 'Every item is made to order on FDM and resin systems. We publish layer height, infill, and estimated print time so you know exactly what you are buying.',
      },
      {
        heading: 'Custom Lab',
        body: 'Upload STL, OBJ, or STEP files for bespoke fabrication. Our team reviews geometry, recommends materials, and quotes within 1–2 business days.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Last updated June 2026',
    sections: [
      {
        heading: 'Data we collect',
        body: 'We collect name, email, phone, and shipping address to fulfil orders. Payment references (UPI/UTR) are stored for reconciliation only.',
      },
      {
        heading: 'How we use it',
        body: 'Order data powers fulfilment, support, and optional email/SMS updates. We do not sell personal data to third parties.',
      },
      {
        heading: 'Your rights',
        body: `Contact ${BRAND_SUPPORT_EMAIL} to request access, correction, or deletion of your data subject to legal retention requirements.`,
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: `${BRAND_NAME} Store`,
    sections: [
      {
        heading: 'Orders',
        body: 'All products are made to order unless marked in stock. Production begins after payment verification (or COD confirmation).',
      },
      {
        heading: 'Pricing',
        body: 'Prices are in INR and include applicable taxes where stated. Shipping is calculated at checkout; free shipping applies above the threshold shown on the site.',
      },
      {
        heading: 'Liability',
        body: '3D prints may show visible layer lines and minor surface variation — this is normal for the process. We warrant against structural defects on arrival.',
      },
    ],
  },
  shipping: {
    title: 'Shipping Information',
    subtitle: 'Pan-India delivery',
    sections: [
      {
        heading: 'Processing',
        body: 'Standard prints ship within 3–7 business days after payment. Complex or Custom Lab jobs may take longer — we email updates at each stage.',
      },
      {
        heading: 'Carriers',
        body: 'We ship via trusted courier partners with tracking. You will receive tracking details when your order leaves the lab.',
      },
      {
        heading: 'Free shipping',
        body: 'Orders above ₹5,000 qualify for free shipping within India (admin can change this threshold in the control panel).',
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    subtitle: 'Defective or damaged items',
    sections: [
      {
        heading: '7-day window',
        body: 'Report defects within 7 days of delivery with photos. We will reprint or refund at our discretion.',
      },
      {
        heading: 'Custom Lab',
        body: 'Custom uploads are non-returnable once production has started unless we fail to meet agreed specifications.',
      },
      {
        heading: 'COD orders',
        body: 'Inspect your package at delivery. Refunds for approved returns are processed within 5–10 business days.',
      },
    ],
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'We respond within 1–2 business days',
    sections: [
      {
        heading: 'Email',
        body: `${BRAND_SUPPORT_EMAIL} — order status, Custom Lab, and wholesale enquiries.`,
      },
      {
        heading: 'Instagram',
        body: `Follow us on Instagram (${BRAND_INSTAGRAM_HANDLE}): ${BRAND_INSTAGRAM_URL}`,
      },
      {
        heading: 'Custom Lab',
        body: 'Use the Custom Lab form on the homepage to upload files and describe your project.',
      },
      {
        heading: 'Track order',
        body: 'Open Track Order from the header with the email used at checkout to see history and production timeline.',
      },
    ],
  },
};