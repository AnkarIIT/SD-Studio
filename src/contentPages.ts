import { BRAND_NAME, BRAND_INSTAGRAM_URL, BRAND_INSTAGRAM_HANDLE, BRAND_SUPPORT_EMAIL, BRAND_SITE_URL } from './brand';

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
    subtitle: 'Effective Date: [DD/MM/YYYY]',
    sections: [
      {
        heading: 'About Us',
        body: '3DbySD designs and sells 3D printed, customized and made-to-order products.',
      },
      {
        heading: 'Eligibility',
        body: 'You must be 18 or older, or have permission from a parent or guardian.',
      },
      {
        heading: 'Products',
        body: 'Minor layer lines and colour variations are normal in 3D printed products.',
      },
      {
        heading: 'Custom Orders',
        body: 'Customers are responsible for the accuracy of names, text, logos and uploaded files.',
      },
      {
        heading: 'Pricing',
        body: 'All prices are in INR and may change without notice.',
      },
      {
        heading: 'Payments',
        body: 'Orders are confirmed only after payment or COD confirmation where applicable.',
      },
      {
        heading: 'Production & Shipping',
        body: 'Production and delivery times are estimates and may vary.',
      },
      {
        heading: 'Returns & Refunds',
        body: 'Customized products are non-returnable unless damaged, defective or incorrect due to our error.',
      },
      {
        heading: 'Damaged Orders',
        body: 'Report damage within 48 hours with photos.',
      },
      {
        heading: 'Intellectual Property',
        body: 'All branding, designs and content belong to 3DbySD.',
      },
      {
        heading: 'Customer Content',
        body: 'Customers confirm they have rights to uploaded artwork.',
      },
      {
        heading: 'Limitation of Liability',
        body: 'Liability is limited to the purchase value of the product.',
      },
      {
        heading: 'Privacy',
        body: 'Customer information is handled according to our Privacy Policy.',
      },
      {
        heading: 'Governing Law',
        body: 'Governed by the laws of India; jurisdiction: Lucknow, Uttar Pradesh.',
      },
      {
        heading: 'Changes',
        body: 'We may update these Terms by publishing a revised version.',
      },
      {
        heading: 'Contact',
        body: `Email: ${BRAND_SUPPORT_EMAIL} | Website: ${BRAND_SITE_URL}`,
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
        body: 'Orders above ₹5,000 qualify for free shipping within India.',
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