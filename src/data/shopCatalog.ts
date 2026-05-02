/**
 * Default catalog for Shop “Stock the Lab” + Admin seed.
 * Prices in INR as digits-only strings for cart/checkout parsing.
 */
export const SHOP_CATEGORIES = ['All', 'Keychains', 'Gaming', 'Home Lab', 'Tech Gear'] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export interface CatalogProduct {
  title: string;
  price: string;
  tag: string;
  color: string;
  image: string;
  description?: string;
}

export const DEFAULT_SHOP_PRODUCTS: CatalogProduct[] = [
  {
    title: 'NFC Keychains',
    price: '199',
    tag: 'Keychains',
    color: 'bg-slate-800',
    image:
      'https://images.unsplash.com/photo-1582142839930-2233e73899d4?q=80&w=900&auto=format&fit=crop',
    description: 'Tap-ready NFC keychains for smart tags and quick links.',
  },
  {
    title: 'Custom NFC Keychains',
    price: '349',
    tag: 'Keychains',
    color: 'bg-violet-600',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=900&auto=format&fit=crop',
    description: 'Personalised NFC — your logo, URL, or digital business card.',
  },
  {
    title: 'Phone Stand',
    price: '349',
    tag: 'Tech Gear',
    color: 'bg-indigo-500',
    image:
      'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=900&auto=format&fit=crop',
    description: 'Stable 3D-printed stand for phones — desk or bedside.',
  },
  {
    title: 'Garage Keychain Holder',
    price: '499',
    tag: 'Home Lab',
    color: 'bg-zinc-700',
    image:
      'https://images.unsplash.com/photo-1621905251198-5eb49198cdbf?q=80&w=900&auto=format&fit=crop',
    description: 'Wall-mounted holder to organise keys and garage remotes.',
  },
  {
    title: 'PS5 Stand',
    price: '499',
    tag: 'Gaming',
    color: 'bg-blue-600',
    image:
      'https://images.unsplash.com/photo-1606144047619-f714ca27352e?q=80&w=900&auto=format&fit=crop',
    description: 'Vertical stand to showcase and vent your console safely.',
  },
  {
    title: 'Single Controller Holder',
    price: '299',
    tag: 'Gaming',
    color: 'bg-rose-600',
    image:
      'https://images.unsplash.com/photo-1598550479359-06088879cf06?q=80&w=900&auto=format&fit=crop',
    description: 'One-slot dock for your favourite controller.',
  },
  {
    title: 'Dual Controller Holder',
    price: '499',
    tag: 'Gaming',
    color: 'bg-purple-600',
    image:
      'https://images.unsplash.com/photo-1542751377-ad0d88642951?q=80&w=900&auto=format&fit=crop',
    description: 'Holds two controllers — neat charging-ready layout.',
  },
];
