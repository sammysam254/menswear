import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  size: string | null;
  color: string | null;
  brand: string | null;
  image_url: string | null;
  stock_quantity: number;
  rating: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  product_images?: {
    id: string;
    image_url: string;
    is_primary: boolean;
  }[];
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            is_primary
          )
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddToCart = (product: Product) => {
    const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url || product.image_url;
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id, // Use the UUID directly as string
        name: product.name,
        price: Number(product.price),
        image: primaryImage || '/placeholder.svg'
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const getProductImage = (product: Product) => {
    return product.product_images?.find(img => img.is_primary)?.image_url || 
           product.image_url || 
           '/placeholder.svg';
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Our Products
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collection of premium fashion items
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product) => (
              <Card 
                key={product.id}
                className="group overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="md:flex">
                  <Link to={`/product/${product.id}`} className="block md:w-1/2">
                    <div className="relative aspect-square overflow-hidden bg-secondary/50">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {product.is_featured && (
                          <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                        )}
                        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                          <Badge variant="destructive">Low Stock</Badge>
                        )}
                        {product.stock_quantity === 0 && (
                          <Badge variant="secondary">Out of Stock</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </Link>
                  
                  <div className="p-6 md:w-1/2 flex flex-col justify-between">
                    <div>
                      <div className="mb-3">
                        <span className="text-sm text-accent font-medium capitalize">{product.category}</span>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-bold text-xl text-primary mt-1 hover:text-accent transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      </div>
                      
                      {product.description && (
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1 mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating)
                                  ? 'text-accent fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({product.rating}/5)
                        </span>
                      </div>

                      <div className="mb-4">
                        <span className="text-2xl font-bold text-primary">
                          KES {Number(product.price).toLocaleString()}
                        </span>
                        {product.size && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Size: {product.size}
                          </p>
                        )}
                        {product.color && (
                          <p className="text-sm text-muted-foreground">
                            Color: {product.color}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity === 0}
                      >
                        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                      <Link to={`/product/${product.id}`} className="block">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/category/shoes">
            <Button size="lg" variant="outline" className="px-8">
              View All Categories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;