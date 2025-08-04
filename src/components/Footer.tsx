import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: 'Shop',
      links: [
        { name: 'Shoes', href: '#shoes' },
        { name: 'Jeans', href: '#jeans' },
        { name: 'Jackets', href: '#jackets' },
        { name: 'Shorts', href: '#shorts' },
        { name: 'New Arrivals', href: '#new' },
        { name: 'Sale', href: '#sale' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Contact Us', href: '#contact' },
        { name: 'Size Guide', href: '#size-guide' },
        { name: 'Shipping Info', href: '#shipping' },
        { name: 'Returns', href: '#returns' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Track Order', href: '#track' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#about' },
        { name: 'Careers', href: '#careers' },
        { name: 'Press', href: '#press' },
        { name: 'Sustainability', href: '#sustainability' },
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
      ],
    },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Newsletter Section */}
        <div className="mb-16 text-center">
          <h3 className="text-3xl font-bold mb-4">Stay in Style</h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and style tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white text-primary border-0"
            />
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap">
              Subscribe
            </Button>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20 mb-16" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">WearWell</h2>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Elevating men's fashion with premium quality clothing that combines style, comfort, and confidence.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contact@wearwell.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">New York, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-accent transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-primary-foreground/20 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/80 text-sm">
            © 2024 WearWell. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-foreground/80">Follow us:</span>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Moving Text Banner */}
      <div className="bg-green-600 py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-white text-sm font-medium">
          this website is designed and developed by sam, contact us at email; sammdev.ai@gmail.com, phone 0707116562 
          &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 
          this website is designed and developed by sam, contact us at email; sammdev.ai@gmail.com, phone 0707116562 
          &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
          this website is designed and developed by sam, contact us at email; sammdev.ai@gmail.com, phone 0707116562
        </div>
      </div>
    </footer>
  );
};

export default Footer;