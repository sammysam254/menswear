import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  mpesa_number: string;
  status: string;
  confirmed_by: string;
  confirmed_at: string;
  created_at: string;
  order: {
    id: string;
    user_id: string;
    total_amount: number;
  };
}

const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          order:orders (
            id,
            user_id,
            total_amount
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'confirmed',
          confirmed_by: user?.id,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      // Also update the order status to processing
      const payment = payments.find(p => p.id === paymentId);
      if (payment) {
        await supabase
          .from('orders')
          .update({ status: 'processing' })
          .eq('id', payment.order_id);
      }

      setPayments(payments.map(payment => 
        payment.id === paymentId 
          ? { 
              ...payment, 
              status: 'confirmed',
              confirmed_by: user?.id || '',
              confirmed_at: new Date().toISOString()
            } 
          : payment
      ));

      toast({
        title: "Success",
        description: "Payment confirmed successfully",
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive",
      });
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'rejected' })
        .eq('id', paymentId);

      if (error) throw error;

      setPayments(payments.map(payment => 
        payment.id === paymentId ? { ...payment, status: 'rejected' } : payment
      ));

      toast({
        title: "Success",
        description: "Payment rejected",
      });
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary">Payment Management</h2>
        <div className="text-sm text-muted-foreground">
          M-Pesa: <span className="font-mono font-semibold">0721398237</span>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No payments found</div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">Payment #{payment.id.slice(0, 8)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Order: #{payment.order_id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    M-Pesa Number: {payment.mpesa_number || 'Not provided'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString()} at{' '}
                    {new Date(payment.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">KES {Number(payment.amount).toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(payment.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </Badge>
                  </div>
                  {payment.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => confirmPayment(payment.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectPayment(payment.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {payment.confirmed_at && (
                <div className="border-t pt-3 text-sm text-muted-foreground">
                  Confirmed on {new Date(payment.confirmed_at).toLocaleDateString()} at{' '}
                  {new Date(payment.confirmed_at).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PaymentManagement;