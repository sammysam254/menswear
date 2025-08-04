// Legacy interface - kept for compatibility
// Note: This application now uses Supabase database for product management
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

// Static products removed - now using Supabase database
// Products are managed through the admin panel at /admin
export const products: Product[] = [];

export const getProductsByCategory = (category: string) => {
  // Legacy function - products now fetched from Supabase
  console.warn('getProductsByCategory is deprecated. Use Supabase queries instead.');
  return [];
};

export const getProductById = (id: number) => {
  // Legacy function - products now fetched from Supabase
  console.warn('getProductById is deprecated. Use Supabase queries instead.');
  return undefined;
};