const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');

const users = [
  { name: 'Super Admin', email: 'superadmin@tea.com', password: 'password123', role: 'superadmin' },
  { name: 'Admin User', email: 'admin@tea.com', password: 'password123', role: 'admin' },
  { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'user' },
];

const products = [
  {
    name: 'Darjeeling First Flush',
    description: 'The champagne of teas. Light, muscatel flavour with floral notes harvested in spring from the Himalayan foothills.',
    shortDescription: 'Premium spring harvest from Darjeeling hills',
    basePrice: 18.99,
    category: 'black-tea',
    flavor: ['floral', 'muscatel', 'fruity'],
    origin: 'Darjeeling, India',
    thumbnail: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
    images: ['https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800'],
    isFeatured: true,
    caffeineLevel: 'medium',
    brewingTime: '3-4 minutes',
    temperature: '90°C',
    tags: ['premium', 'single-origin', 'first-flush'],
    variants: [
      { name: '50g', weight: '50g', priceModifier: 0, stock: 45, sku: 'DFF-50' },
      { name: '100g', weight: '100g', priceModifier: 12, stock: 30, sku: 'DFF-100' },
      { name: '200g', weight: '200g', priceModifier: 28, stock: 20, sku: 'DFF-200' },
    ],
  },
  {
    name: 'Ceremonial Grade Matcha',
    description: 'Stone-ground from shade-grown tencha leaves in Uji, Japan. Vibrant green colour with umami sweetness and no bitterness.',
    shortDescription: 'Authentic Japanese ceremonial matcha',
    basePrice: 29.99,
    category: 'matcha',
    flavor: ['umami', 'sweet', 'vegetal'],
    origin: 'Uji, Japan',
    thumbnail: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800'],
    isFeatured: true,
    caffeineLevel: 'high',
    brewingTime: 'Whisk 30 seconds',
    temperature: '70°C',
    tags: ['ceremonial', 'japan', 'matcha'],
    variants: [
      { name: '30g', weight: '30g', priceModifier: 0, stock: 50, sku: 'MAT-30' },
      { name: '50g', weight: '50g', priceModifier: 15, stock: 35, sku: 'MAT-50' },
      { name: '100g', weight: '100g', priceModifier: 35, stock: 25, sku: 'MAT-100' },
    ],
  },
  {
    name: 'Silver Needle White Tea',
    description: 'Only the finest unopened buds hand-picked in early spring from Fuding, China. Delicate, sweet and refreshing.',
    shortDescription: 'Rare hand-picked white tea buds',
    basePrice: 24.99,
    category: 'white-tea',
    flavor: ['sweet', 'delicate', 'honey'],
    origin: 'Fuding, Fujian, China',
    thumbnail: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400',
    images: ['https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800'],
    isFeatured: true,
    caffeineLevel: 'low',
    brewingTime: '4-5 minutes',
    temperature: '75°C',
    tags: ['rare', 'white-tea', 'china'],
    variants: [
      { name: '25g', weight: '25g', priceModifier: 0, stock: 30, sku: 'SN-25' },
      { name: '50g', weight: '50g', priceModifier: 18, stock: 20, sku: 'SN-50' },
      { name: '100g', weight: '100g', priceModifier: 40, stock: 15, sku: 'SN-100' },
    ],
  },
  {
    name: 'Masala Chai Blend',
    description: 'A bold, spicy blend of Assam CTC tea with cinnamon, cardamom, ginger, cloves and black pepper. Authentic Indian street chai.',
    shortDescription: 'Authentic spiced Indian chai blend',
    basePrice: 12.99,
    category: 'chai',
    flavor: ['spicy', 'warming', 'bold'],
    origin: 'Assam, India',
    thumbnail: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400',
    images: ['https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800'],
    isFeatured: false,
    caffeineLevel: 'high',
    brewingTime: '5 minutes (boiled with milk)',
    temperature: '100°C',
    tags: ['chai', 'spiced', 'assam', 'bestseller'],
    variants: [
      { name: '100g', weight: '100g', priceModifier: 0, stock: 80, sku: 'MCI-100' },
      { name: '200g', weight: '200g', priceModifier: 10, stock: 60, sku: 'MCI-200' },
      { name: '500g', weight: '500g', priceModifier: 28, stock: 40, sku: 'MCI-500' },
    ],
  },
  {
    name: 'Chamomile & Lavender Herbal',
    description: 'A soothing caffeine-free blend of chamomile flowers and French lavender buds. Perfect for winding down before sleep.',
    shortDescription: 'Calming bedtime herbal blend',
    basePrice: 10.99,
    category: 'herbal-tea',
    flavor: ['floral', 'calming', 'honey'],
    origin: 'Egypt & France',
    thumbnail: 'https://images.unsplash.com/photo-1587736-538b42f344be?w=400',
    images: ['https://images.unsplash.com/photo-1587736-538b42f344be?w=800'],
    isFeatured: false,
    caffeineLevel: 'none',
    brewingTime: '5-7 minutes',
    temperature: '95°C',
    tags: ['caffeine-free', 'sleep', 'herbal', 'relaxing'],
    variants: [
      { name: '40g (20 bags)', weight: '40g', priceModifier: 0, stock: 100, sku: 'CHL-20' },
      { name: '80g (40 bags)', weight: '80g', priceModifier: 8, stock: 75, sku: 'CHL-40' },
    ],
  },
  {
    name: 'Tie Guan Yin Oolong',
    description: 'The Iron Goddess of Mercy. A lightly oxidised oolong with orchid aroma, creamy texture and long lingering finish.',
    shortDescription: 'Classic Chinese oolong with orchid aroma',
    basePrice: 21.99,
    category: 'oolong-tea',
    flavor: ['floral', 'creamy', 'orchid'],
    origin: 'Anxi, Fujian, China',
    thumbnail: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400',
    images: ['https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800'],
    isFeatured: true,
    caffeineLevel: 'medium',
    brewingTime: '3-4 minutes',
    temperature: '85°C',
    tags: ['oolong', 'china', 'traditional'],
    variants: [
      { name: '50g', weight: '50g', priceModifier: 0, stock: 40, sku: 'TGY-50' },
      { name: '100g', weight: '100g', priceModifier: 16, stock: 25, sku: 'TGY-100' },
      { name: '200g', weight: '200g', priceModifier: 35, stock: 15, sku: 'TGY-200' },
    ],
  },
  {
    name: 'Dragon Well (Longjing) Green',
    description: 'Pan-fired green tea from Hangzhou with a distinctive flat leaf shape, chestnut aroma and refreshingly clean finish.',
    shortDescription: 'Premium pan-fired Chinese green tea',
    basePrice: 16.99,
    category: 'green-tea',
    flavor: ['chestnut', 'fresh', 'sweet'],
    origin: 'Hangzhou, Zhejiang, China',
    thumbnail: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400',
    images: ['https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800'],
    isFeatured: false,
    caffeineLevel: 'medium',
    brewingTime: '2-3 minutes',
    temperature: '80°C',
    tags: ['green-tea', 'longjing', 'china'],
    variants: [
      { name: '50g', weight: '50g', priceModifier: 0, stock: 55, sku: 'DWG-50' },
      { name: '100g', weight: '100g', priceModifier: 13, stock: 35, sku: 'DWG-100' },
      { name: '250g', weight: '250g', priceModifier: 32, stock: 20, sku: 'DWG-250' },
    ],
  },
  {
    name: 'Earl Grey Supreme',
    description: 'Classic black tea blended with real bergamot oil and blue cornflower petals. A refined, citrus-floral everyday tea.',
    shortDescription: 'Classic bergamot black tea with cornflower',
    basePrice: 11.99,
    category: 'black-tea',
    flavor: ['citrus', 'bergamot', 'floral'],
    origin: 'Blend',
    thumbnail: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    images: ['https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'],
    isFeatured: false,
    caffeineLevel: 'medium',
    brewingTime: '3-4 minutes',
    temperature: '95°C',
    tags: ['earl-grey', 'bergamot', 'classic', 'bestseller'],
    variants: [
      { name: '100g (loose)', weight: '100g', priceModifier: 0, stock: 90, sku: 'EGS-100' },
      { name: '200g (loose)', weight: '200g', priceModifier: 9, stock: 60, sku: 'EGS-200' },
      { name: '20 Pyramid Bags', weight: '40g', priceModifier: 3, stock: 70, sku: 'EGS-20B' },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Product.deleteMany()]);
    console.log('Cleared existing data');

    // Create users (passwords auto-hashed by pre-save hook)
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create products
    const createdProducts = await Product.create(products);
    console.log(`Created ${createdProducts.length} products`);

    console.log('\n✅ Seed complete!');
    console.log('Login credentials:');
    console.log('  Superadmin: superadmin@tea.com / password123');
    console.log('  Admin:      admin@tea.com / password123');
    console.log('  User:       john@example.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
