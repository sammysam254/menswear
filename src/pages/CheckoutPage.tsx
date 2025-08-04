import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    county: 'Nairobi',
    zipCode: '',
    country: 'Kenya'
  });
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'address', 'city', 'county', 'zipCode'];
    return required.every(field => shippingInfo[field as keyof typeof shippingInfo].trim() !== '');
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to place an order",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (state.items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: state.total * 1.08, // Including tax
          status: 'pending',
          shipping_address: shippingInfo,
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = state.items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      dispatch({ type: 'CLEAR_CART' });

      toast({
        title: "Order placed successfully!",
        description: `Order #${orderData.id.slice(0, 8)} has been submitted`,
      });

      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">Your cart is empty</h1>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/cart')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold text-primary mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={shippingInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={shippingInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="city">City/Town *</Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Nairobi"
                  />
                </div>
                <div>
                  <Label htmlFor="county">County *</Label>
                  <Select value={shippingInfo.county} onValueChange={(value) => handleInputChange('county', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      <SelectItem value="Baringo">Baringo</SelectItem>
                      <SelectItem value="Bomet">Bomet</SelectItem>
                      <SelectItem value="Bungoma">Bungoma</SelectItem>
                      <SelectItem value="Busia">Busia</SelectItem>
                      <SelectItem value="Elgeyo-Marakwet">Elgeyo-Marakwet</SelectItem>
                      <SelectItem value="Embu">Embu</SelectItem>
                      <SelectItem value="Garissa">Garissa</SelectItem>
                      <SelectItem value="Homa Bay">Homa Bay</SelectItem>
                      <SelectItem value="Isiolo">Isiolo</SelectItem>
                      <SelectItem value="Kajiado">Kajiado</SelectItem>
                      <SelectItem value="Kakamega">Kakamega</SelectItem>
                      <SelectItem value="Kericho">Kericho</SelectItem>
                      <SelectItem value="Kiambu">Kiambu</SelectItem>
                      <SelectItem value="Kilifi">Kilifi</SelectItem>
                      <SelectItem value="Kirinyaga">Kirinyaga</SelectItem>
                      <SelectItem value="Kisii">Kisii</SelectItem>
                      <SelectItem value="Kisumu">Kisumu</SelectItem>
                      <SelectItem value="Kitui">Kitui</SelectItem>
                      <SelectItem value="Kwale">Kwale</SelectItem>
                      <SelectItem value="Laikipia">Laikipia</SelectItem>
                      <SelectItem value="Lamu">Lamu</SelectItem>
                      <SelectItem value="Machakos">Machakos</SelectItem>
                      <SelectItem value="Makueni">Makueni</SelectItem>
                      <SelectItem value="Mandera">Mandera</SelectItem>
                      <SelectItem value="Marsabit">Marsabit</SelectItem>
                      <SelectItem value="Meru">Meru</SelectItem>
                      <SelectItem value="Migori">Migori</SelectItem>
                      <SelectItem value="Mombasa">Mombasa</SelectItem>
                      <SelectItem value="Murang'a">Murang'a</SelectItem>
                      <SelectItem value="Nairobi">Nairobi</SelectItem>
                      <SelectItem value="Nakuru">Nakuru</SelectItem>
                      <SelectItem value="Nandi">Nandi</SelectItem>
                      <SelectItem value="Narok">Narok</SelectItem>
                      <SelectItem value="Nyamira">Nyamira</SelectItem>
                      <SelectItem value="Nyandarua">Nyandarua</SelectItem>
                      <SelectItem value="Nyeri">Nyeri</SelectItem>
                      <SelectItem value="Samburu">Samburu</SelectItem>
                      <SelectItem value="Siaya">Siaya</SelectItem>
                      <SelectItem value="Taita-Taveta">Taita-Taveta</SelectItem>
                      <SelectItem value="Tana River">Tana River</SelectItem>
                      <SelectItem value="Tharaka-Nithi">Tharaka-Nithi</SelectItem>
                      <SelectItem value="Trans Nzoia">Trans Nzoia</SelectItem>
                      <SelectItem value="Turkana">Turkana</SelectItem>
                      <SelectItem value="Uasin Gishu">Uasin Gishu</SelectItem>
                      <SelectItem value="Vihiga">Vihiga</SelectItem>
                      <SelectItem value="Wajir">Wajir</SelectItem>
                      <SelectItem value="West Pokot">West Pokot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="00100"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={shippingInfo.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Payment Method</h2>
              
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
              
              <p className="text-sm text-muted-foreground mt-2">
                This is a demo checkout. No actual payment will be processed.
              </p>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold text-primary mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">KES {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KES {state.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>KES {(state.total * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>KES {(state.total * 1.08).toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;