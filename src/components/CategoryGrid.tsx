import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jeansImage from '@/assets/jeans-category.jpg';
import shoesImage from '@/assets/shoes-category.jpg';
import jacketsImage from '@/assets/jackets-category.jpg';
import shortsImage from '@/assets/shorts-category.jpg';

const CategoryGrid = () => {
  const categories = [
    {
      id: 'shoes',
      name: 'Shoes',
      image: shoesImage,
      description: 'Step up your game with our premium footwear collection',
      itemCount: '250+ styles'
    },
    {
      id: 'jeans',
      name: 'Jeans',
      image: jeansImage,
      description: 'Perfect fit, premium denim for every occasion',
      itemCount: '180+ styles'
    },
    {
      id: 'jackets',
      name: 'Jackets',
      image: jacketsImage,
      description: 'Layer up in style with our versatile jacket collection',
      itemCount: '120+ styles'
    },
    {
      id: 'shorts',
      name: 'Shorts',
      image: shortsImage,
      description: 'Stay cool and comfortable in premium summer essentials',
      itemCount: '90+ styles'
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our carefully curated collections designed for the modern man
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.id}`}>
              <Card 
                className="group overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      Explore {category.name}
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-primary">{category.name}</h3>
                    <span className="text-sm text-accent font-medium">{category.itemCount}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;