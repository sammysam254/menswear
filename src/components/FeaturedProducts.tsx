import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const FeaturedProducts = () => {
  const { dispatch } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = (product: any) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const products = [
    {
      id: 1,
      name: 'Premium Denim Jacket',
      price: 189,
      originalPrice: 249,
      rating: 4.8,
      reviews: 124,
      image: '/placeholder.svg',
      category: 'Jackets',
      isNew: true,
    },
    {
      id: 2,
      name: 'Classic White Sneakers',
      price: 129,
      originalPrice: null,
      rating: 4.9,
      reviews: 89,
      image: '/placeholder.svg',
      category: 'Shoes',
      isNew: false,
    },
    {
      id: 3,
      name: 'Slim Fit Dark Jeans',
      price: 99,
      originalPrice: 139,
      rating: 4.7,
      reviews: 156,
      image: '/placeholder.svg',
      category: 'Jeans',
      isNew: false,
    },
    {
      id: 4,
      name: 'Summer Cargo Shorts',
      price: 69,
      originalPrice: null,
      rating: 4.6,
      reviews: 73,
      image: '/placeholder.svg',
      category: 'Shorts',
      isNew: true,
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked favorites from our latest collection
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="group overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <Link to={`/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-secondary/50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.isNew && (
                      <Badge className="bg-accent text-accent-foreground">New</Badge>
                    )}
                    {product.originalPrice && (
                      <Badge variant="destructive">Sale</Badge>
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
                  <div className="absolute bottom-3 left-3 right-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                    >
                      Quick Add
                    </Button>
                  </div>
                </div>
              </Link>
              
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-sm text-accent font-medium">{product.category}</span>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-primary mt-1 line-clamp-2 hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                </div>
                
                <div className="flex items-center gap-1 mb-3">
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
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews})
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    KES {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      KES {product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/category/shoes">
            <Button size="lg" variant="outline" className="px-8">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;