import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data (optional, but safe)
  await prisma.product.deleteMany({});

  // Products list (14 products)
  const products = [
    { name: 'Articulated Robot Toy', slug: 'articulated-robot-toy', description: 'Fun robot with moving joints', category: 'TOYS', base_price: 4299, discounted_price: 5299, is_on_sale: true, is_new: true, is_bestseller: false },
    { name: 'Gaming Controller Stand', slug: 'gaming-controller-stand', description: 'Stand for PS5/Xbox controller', category: 'ACCESSORIES', base_price: 1599, discounted_price: 2099, is_on_sale: true, is_new: false, is_bestseller: false },
    { name: 'Abstract Wall Art Panel', slug: 'abstract-wall-art-panel', description: 'Modern 3D printed wall art', category: 'HOME_DECOR', base_price: 3499, discounted_price: 4299, is_on_sale: true, is_new: false, is_bestseller: false },
    { name: 'Minimalist Pen Holder', slug: 'minimalist-pen-holder', description: 'Clean design desk organizer', category: 'HOME_DECOR', base_price: 799, discounted_price: 1199, is_on_sale: true, is_new: false, is_bestseller: false },
    { name: 'Plant Pot Stand Set', slug: 'plant-pot-stand-set', description: 'Set of 3 plant pot stands', category: 'HOME_DECOR', base_price: 2499, discounted_price: 3199, is_on_sale: true, is_new: false, is_bestseller: false },
    { name: 'Geometric Desk Organizer', slug: 'geometric-desk-organizer', description: 'Modern geometric design', category: 'HOME_DECOR', base_price: 1899, discounted_price: 2499, is_on_sale: true, is_new: false, is_bestseller: false },
    { name: 'Custom Car Garage Key Holder', slug: 'custom-car-garage-key-holder', description: '3D printed custom car garage style key holder with hooks', category: 'HOME_DECOR', base_price: 399, discounted_price: null, is_on_sale: false, is_new: true, is_bestseller: false },
    { name: 'Ghost Skull Mask', slug: 'ghost-skull-mask', description: 'Halloween special ghost skull mask with detailed texture', category: 'ACCESSORIES', base_price: 799, discounted_price: null, is_on_sale: false, is_new: true, is_bestseller: false },
    { name: 'Loopy Chill Lamp (Crimson Edition)', slug: 'loopy-chill-lamp-crimson', description: 'Unique loop design LED lamp with crimson finish', category: 'HOME_DECOR', base_price: 799, discounted_price: null, is_on_sale: false, is_new: true, is_bestseller: false },
    { name: 'NFC Instagram Keychain', slug: 'nfc-instagram-keychain', description: 'Custom NFC keychain with Instagram profile link', category: 'ACCESSORIES', base_price: 299, discounted_price: null, is_on_sale: false, is_new: true, is_bestseller: false },
    { name: 'Shy Lamp™', slug: 'shy-lamp', description: 'Minimalist shy lamp with dimmable warm light', category: 'HOME_DECOR', base_price: 799, discounted_price: null, is_on_sale: false, is_new: true, is_bestseller: false },
    { name: 'Spider-Man Mask with Texture', slug: 'spiderman-mask-texture', description: 'Detailed Spider-Man mask with webbing texture', category: 'COSTUMES', base_price: 2999, discounted_price: null, is_on_sale: false, is_new: true, is_bestseller: false },
    { name: 'Spider-Man String Art', slug: 'spiderman-string-art', description: '3D printed Spider-Man string art wall decoration', category: 'WALL_ART', base_price: 399, discounted_price: null, is_on_sale: false, is_new: true, is_bestseller: false },
    { name: 'Wobbly Penguin', slug: 'wobbly-penguin', description: 'Cute wobbling penguin desktop toy', category: 'TOYS', base_price: 299, discounted_price: null, is_on_sale: false, is_new: true, is_bestseller: false },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Seeded 14 products successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
