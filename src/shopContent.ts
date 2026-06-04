export const HERO_SLIDES = [
  {
    id: 'shop-prints',
    image: '/banners/shop-prints.jpg',
    imageAlt: '3D printer creating a decorative vase — shop home decor prints',
    title: 'Shop 3D printed objects',
    subtitle: 'Lamps, desk gear & collectibles — made to order in India',
    cta: 'Shop now',
    href: '#catalog',
  },
  {
    id: 'custom-lab',
    image: '/banners/custom-lab.jpg',
    imageAlt: 'Engineer operating a 3D printer with a custom model',
    title: 'Upload your own design',
    subtitle: 'Custom Lab · FDM & resin · Ships in 1–7 days',
    cta: 'Custom Lab',
    href: '#custom-lab',
  },
  {
    id: 'free-ship',
    image: '/categories/collectibles.jpg',
    imageAlt: '3D-printed collectible figurine — free shipping promo',
    title: 'Free shipping over ₹5,000',
    subtitle: 'UPI · Cards · Bank transfer · COD',
    cta: 'View catalog',
    href: '#catalog',
  },
];

export const CATEGORY_TILES = [
  {
    id: 'home-decor',
    title: 'Home Decor',
    subtitle: 'Lamps, planters & wall pieces',
    image: '/categories/home-decor.jpg',
    imageAlt: '3D printer creating a decorative vase for home decor',
    href: '#catalog',
    filter: 'Home Decor',
  },
  {
    id: 'collectibles',
    title: 'Collectibles & Toys',
    subtitle: 'Articulated figures & display prints',
    image: '/categories/collectibles.jpg',
    imageAlt: '3D-printed green dragon collectible figurine',
    href: '#catalog',
    filter: 'Toys',
  },
  {
    id: 'tech',
    title: 'Tech Accessories',
    subtitle: 'Organizers, stands & enclosures',
    image: '/categories/tech-accessories.jpg',
    imageAlt: '3D-printed snake-shaped desk pencil holder',
    href: '#catalog',
    filter: 'Tech',
  },
  {
    id: 'custom',
    title: 'Custom Lab',
    subtitle: 'Your file · our printers',
    image: '/categories/custom-lab.jpg',
    imageAlt: 'Person operating a 3D printer with a custom model',
    href: '#custom-lab',
    filter: null,
  },
];

export const COLLECTIONS = [
  {
    id: 'sci-fi',
    title: 'Sci-Fi & Gaming',
    image: '/categories/collectibles.jpg',
    href: '#catalog',
  },
  {
    id: 'minimal',
    title: 'Minimal Desk',
    image: '/categories/tech-accessories.jpg',
    href: '#catalog',
  },
  {
    id: 'art',
    title: 'Art & Sculptures',
    image: '/banners/shop-prints.jpg',
    href: '#catalog',
  },
  {
    id: 'home',
    title: 'Home & Living',
    image: '/categories/home-decor.jpg',
    href: '#catalog',
  },
  {
    id: 'tech-desk',
    title: 'Workspace Essentials',
    image: '/categories/tech-accessories.jpg',
    href: '#catalog',
  },
  {
    id: 'gifts',
    title: 'Gift Picks',
    image: '/categories/collectibles.jpg',
    href: '#catalog',
  },
];

export const CATEGORY_NAV = [
  { id: 'home', label: 'Home Decor', filter: 'Home Decor' },
  { id: 'tech', label: 'Tech', filter: 'Tech' },
  { id: 'art', label: 'Art', filter: 'Art' },
  { id: 'toys', label: 'Collectibles', filter: 'Toys' },
  { id: 'custom', label: 'Custom Lab', filter: null },
] as const;

export const BEST_SELLER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'Home Decor', label: 'Home Decor' },
  { id: 'Toys', label: 'Collectibles' },
  { id: 'Tech', label: 'Tech' },
  { id: 'Art', label: 'Art' },
] as const;