export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  isNew: boolean;
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
}

export const products: Product[] = [
  // Shoes
  {
    id: 1,
    name: 'Classic White Sneakers',
    price: 129,
    rating: 4.9,
    reviews: 89,
    image: '/placeholder.svg',
    category: 'shoes',
    isNew: false,
    description: 'Premium leather sneakers with classic white design. Perfect for everyday wear.',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['White', 'Black'],
    inStock: true,
  },
  {
    id: 2,
    name: 'Athletic Running Shoes',
    price: 149,
    originalPrice: 189,
    rating: 4.7,
    reviews: 156,
    image: '/placeholder.svg',
    category: 'shoes',
    isNew: true,
    description: 'High-performance running shoes with advanced cushioning technology.',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'Navy', 'Gray'],
    inStock: true,
  },
  {
    id: 3,
    name: 'Leather Oxford Shoes',
    price: 199,
    rating: 4.8,
    reviews: 73,
    image: '/placeholder.svg',
    category: 'shoes',
    isNew: false,
    description: 'Handcrafted leather oxford shoes for formal occasions.',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Brown', 'Black'],
    inStock: true,
  },

  // Jeans
  {
    id: 4,
    name: 'Slim Fit Dark Jeans',
    price: 99,
    originalPrice: 139,
    rating: 4.7,
    reviews: 156,
    image: '/placeholder.svg',
    category: 'jeans',
    isNew: false,
    description: 'Premium denim with a modern slim fit. Perfect for casual and smart-casual looks.',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Dark Blue', 'Black'],
    inStock: true,
  },
  {
    id: 5,
    name: 'Regular Fit Blue Jeans',
    price: 89,
    rating: 4.6,
    reviews: 124,
    image: '/placeholder.svg',
    category: 'jeans',
    isNew: true,
    description: 'Classic regular fit jeans in premium blue denim.',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Blue', 'Light Blue'],
    inStock: true,
  },
  {
    id: 6,
    name: 'Stretch Skinny Jeans',
    price: 119,
    rating: 4.5,
    reviews: 98,
    image: '/placeholder.svg',
    category: 'jeans',
    isNew: false,
    description: 'Comfortable stretch denim with a modern skinny fit.',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Black', 'Dark Blue'],
    inStock: true,
  },

  // Jackets
  {
    id: 7,
    name: 'Premium Denim Jacket',
    price: 189,
    originalPrice: 249,
    rating: 4.8,
    reviews: 124,
    image: '/placeholder.svg',
    category: 'jackets',
    isNew: true,
    description: 'Classic denim jacket with premium finishing and modern fit.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Blue', 'Black'],
    inStock: true,
  },
  {
    id: 8,
    name: 'Leather Bomber Jacket',
    price: 299,
    rating: 4.9,
    reviews: 67,
    image: '/placeholder.svg',
    category: 'jackets',
    isNew: false,
    description: 'Genuine leather bomber jacket with classic styling.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Brown'],
    inStock: true,
  },
  {
    id: 9,
    name: 'Casual Blazer',
    price: 179,
    rating: 4.6,
    reviews: 89,
    image: '/placeholder.svg',
    category: 'jackets',
    isNew: false,
    description: 'Smart-casual blazer perfect for business and social occasions.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'Gray', 'Black'],
    inStock: true,
  },

  // Shorts
  {
    id: 10,
    name: 'Summer Cargo Shorts',
    price: 69,
    rating: 4.6,
    reviews: 73,
    image: '/placeholder.svg',
    category: 'shorts',
    isNew: true,
    description: 'Comfortable cargo shorts perfect for summer activities.',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Khaki', 'Navy', 'Black'],
    inStock: true,
  },
  {
    id: 11,
    name: 'Athletic Performance Shorts',
    price: 59,
    originalPrice: 79,
    rating: 4.7,
    reviews: 156,
    image: '/placeholder.svg',
    category: 'shorts',
    isNew: false,
    description: 'Moisture-wicking athletic shorts for workouts and sports.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Gray'],
    inStock: true,
  },
  {
    id: 12,
    name: 'Casual Chino Shorts',
    price: 79,
    rating: 4.5,
    reviews: 94,
    image: '/placeholder.svg',
    category: 'shorts',
    isNew: false,
    description: 'Classic chino shorts for smart-casual summer looks.',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Beige', 'Navy', 'Olive'],
    inStock: true,
  },
];

export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.category === category);
};

export const getProductById = (id: number) => {
  return products.find(product => product.id === id);
};