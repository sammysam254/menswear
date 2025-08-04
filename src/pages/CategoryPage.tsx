import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart } from 'lucide-react';
import { getProductsByCategory } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { dispatch } = useCart();
  const { toast } = useToast();
  
  const products = category ? getProductsByCategory(category) : [];
  
  const categoryNames: { [key: string]: string } = {
    shoes: 'Shoes',
    jeans: 'Jeans',
    jackets: 'Jackets',
    shorts: 'Shorts'
  };

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

  if (!category || !categoryNames[category]) {
    return <div>Category not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Home</Link> / {categoryNames[category]}
          </nav>
          <h1 className="text-4xl font-bold text-primary mb-2">{categoryNames[category]}</h1>
          <p className="text-xl text-muted-foreground">
            Discover our premium collection of {categoryNames[category].toLowerCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                </div>
              </Link>
              
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-sm text-accent font-medium">{categoryNames[product.category]}</span>
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
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;