import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Plus, Minus, Download, CreditCard, Trash2, AlertTriangle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { apis } from '@/utils/apis';
import { UserSubscription, Payment, PaymentMethod } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/types';

export default function Subscription() {
  const { Get, Put } = useApi();
  const { user } = useSelector((state: RootState) => state.auth);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [autoRenew, setAutoRenew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showPreviousSubscriptions, setShowPreviousSubscriptions] = useState(false);

  const userId = (user as any)?.user_id;

  useEffect(() => {
    if (userId) {
      fetchSubscriptionData();
      fetchPaymentData();
    }
  }, [userId]);

  const fetchSubscriptionData = async () => {
    try {
      console.log('Fetching subscription data for user:', userId);
      const data = await Get<UserSubscription[]>(`/v1/user-subscriptions/by-user/${userId}`);
      console.log('Subscription data received:', data);
      if (data) {
        setUserSubscriptions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setUserSubscriptions([]);
    }
  };

  const fetchPaymentData = async () => {
    try {
      console.log('Fetching payment data for user:', userId);
      const data = await Get<Payment[]>(`/v1/payments/by-user/${userId}`);
      console.log('Payment data received:', data);
      if (data) {
        // API returns payments directly as an array
        setPayments(Array.isArray(data) ? data : []);
        // Payment methods might be in a separate endpoint or not available
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setPayments([]);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>;
      case 'mastercard':
        return <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>;
      case 'amex':
        return <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>;
      default:
        return <div className="w-8 h-5 bg-gray-400 rounded text-white text-xs flex items-center justify-center font-bold">CARD</div>;
    }
  };

  const getPlanDisplayName = (planType: string) => {
    // Capitalize the first letter of the plan_type
    return planType.charAt(0).toUpperCase() + planType.slice(1);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Get current active subscription (most recent by creation date)
  const getCurrentSubscription = () => {
    const activeSubscriptions = userSubscriptions.filter(sub => sub.status_active);
    if (activeSubscriptions.length > 0) {
      // Return the most recently created active subscription
      return activeSubscriptions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
    }
    // If no active subscription, return null
    return null;
  };

  // Check if there are any active subscriptions
  const hasActiveSubscriptions = () => {
    return userSubscriptions.some(sub => sub.status_active);
  };

  // Get previous subscriptions (inactive ones)
  const getPreviousSubscriptions = () => {
    return userSubscriptions
      .filter(sub => !sub.status_active)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  // Get available plans sorted by creation date (newest first)
  const getAvailablePlans = () => {
    const current = getCurrentSubscription();
    if (current) {
      return userSubscriptions
        .filter(sub => sub.user_subscription_id !== current.user_subscription_id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return userSubscriptions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // Get plans to display based on showAllPlans state
  const getDisplayPlans = () => {
    const allPlans = getAvailablePlans();
    if (showAllPlans) {
      return allPlans;
    }
    // Show only the most recent plan (first one after current)
    return allPlans.slice(0, 1);
  };

  // Get remaining plans count
  const getRemainingPlansCount = () => {
    const allPlans = getAvailablePlans();
    return Math.max(0, allPlans.length - 1);
  };

  // Handle upgrade button click
  const handleUpgrade = () => {
    window.location.href = "https://www.real-sales.com/pricing";
  };

  // Handle cancel subscription
  const handleCancelSubscription = () => {
    setShowCancelDialog(true);
  };

  // Confirm cancellation
  const confirmCancellation = async () => {
    const currentSub = getCurrentSubscription();
    if (!currentSub) return;

    setCancelling(true);
    
    try {
      const response = await Put(`/v1/user-subscriptions/${currentSub.user_subscription_id}`, {
        status_active: false
      });
      
      if (response) {
        // Refresh subscription data to reflect the change
        await fetchSubscriptionData();
        console.log('Subscription cancelled successfully');
        setShowCancelDialog(false);
        // You can add a toast notification here if you have one
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      // You can add error toast notification here
    } finally {
      setCancelling(false);
    }
  };

  // Cancel the cancellation
  const cancelCancellation = () => {
    setShowCancelDialog(false);
  };

  // Get subscription details by subscription_id
  const getSubscriptionById = (subscriptionId: string) => {
    return userSubscriptions.find(sub => sub.subscription_id === subscriptionId);
  };

  // Get the most recent payment amount for a subscription
  const getPaymentAmountForSubscription = (subscriptionId: string) => {
    const recentPayment = payments
      .filter(payment => payment.subscription_id === subscriptionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    return recentPayment ? parseFloat(recentPayment.amount) : 0;
  };

  // Get display price for a subscription (payment amount or monthly price)
  const getDisplayPrice = (subscription: any) => {
    if (subscription.subscription.billing_cycle === 'yearly') {
      // For yearly, show the actual payment amount
      const paymentAmount = getPaymentAmountForSubscription(subscription.subscription_id);
      return paymentAmount > 0 ? paymentAmount : subscription.subscription.yearly_price || subscription.subscription.monthly_price;
    } else {
      // For monthly, show monthly price
      return subscription.subscription.monthly_price;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && userSubscriptions.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Subscription Data</h2>
          <p className="text-gray-600 mb-6">Unable to load subscription information. Please try again later.</p>
          <Button onClick={() => {
            setLoading(true);
            fetchSubscriptionData();
            fetchPaymentData();
          }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 z-0 bg-repeat w-full h-full"
        style={{ 
          backgroundImage: 'url("/AISALES-DOTTED-BG-FRAME.png")',
          backgroundSize: '30px 30px',
          backgroundPosition: 'center',
          opacity: 0.15
        }}
      />
      
      <div className="relative max-w-7xl mx-auto p-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Subscription Management
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Manage your subscription, billing, and payment methods in one place.
          </p>
        </div>

        {/* Plan Section */}
        <Card className="border border-slate-200 shadow-sm backdrop-blur-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-white">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Plan or No Active Subscription */}
              {getCurrentSubscription() ? (
                <Card className="relative border-2 border-yellow-200 shadow-lg">
                  <div className="absolute top-4 right-4">
                    <Check className="w-6 h-6 text-yellow-600" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {getPlanDisplayName(getCurrentSubscription()?.subscription.plan_type || '')}
                    </CardTitle>
                    <div className="space-y-1">
                      <p className="text-slate-600">
                        {getCurrentSubscription()?.end_date 
                          ? `${getDaysRemaining(getCurrentSubscription()?.end_date || '')} days remaining`
                          : 'Active'
                        }
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-500">
                          Credits: {getCurrentSubscription()?.credits_remaining || 0} / {getCurrentSubscription()?.credits_allocated || 0}
                        </p>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${getCurrentSubscription()?.credits_allocated ? 
                                ((getCurrentSubscription()?.credits_used || 0) / getCurrentSubscription()?.credits_allocated) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-yellow-700 bg-clip-text text-transparent">
                        {getCurrentSubscription()?.subscription.billing_cycle === 'yearly' 
                          ? `${formatCurrency(getDisplayPrice(getCurrentSubscription()!))}/year`
                          : `${formatCurrency(getDisplayPrice(getCurrentSubscription()!))}/month`
                        }
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      onClick={handleCancelSubscription}
                    >
                      Cancel Subscription
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="relative border-2 border-slate-200 shadow-lg bg-gradient-to-br from-slate-50 to-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      No Active Subscription
                    </CardTitle>
                    <p className="text-slate-600">
                      You don't have any active subscriptions available
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-slate-700 text-sm">
                          <strong>Upgrade now</strong> to use the benefits of our premium features and unlock your full potential.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-500 hover:to-yellow-600 font-semibold"
                          onClick={handleUpgrade}
                        >
                          Upgrade Now
                        </Button>
                        {getPreviousSubscriptions().length > 0 && (
                          <Button 
                            variant="outline"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => setShowPreviousSubscriptions(!showPreviousSubscriptions)}
                          >
                            {showPreviousSubscriptions ? 'Hide Previous' : 'View Previous'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Available Plans - Only show if there are active subscriptions */}
              {hasActiveSubscriptions() && getDisplayPlans().map((plan, index) => (
                <Card key={plan.user_subscription_id} className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-slate-900 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                      {getPlanDisplayName(plan.subscription.plan_type)}
                    </CardTitle>
                    <div className="space-y-1">
                      <p className="text-slate-700">
                        {plan.subscription.billing_cycle === 'yearly' ? '365 days' : '30 days'}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600">
                          Credits: {plan.credits_remaining || 0} / {plan.credits_allocated || 0}
                        </p>
                        <div className="w-full bg-slate-300 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-slate-700 to-slate-900 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${plan.credits_allocated ? 
                                ((plan.credits_used || 0) / plan.credits_allocated) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold">
                        {plan.subscription.billing_cycle === 'yearly' 
                          ? `${formatCurrency(getDisplayPrice(plan))}/year`
                          : `${formatCurrency(getDisplayPrice(plan))}/month`
                        }
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="bg-slate-900 text-white hover:bg-slate-800 flex-1"
                        onClick={handleUpgrade}
                      >
                        Upgrade
                      </Button>
                      <Button variant="ghost" className="text-slate-900 hover:bg-slate-100 flex-1">
                        Learn more
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Default Professional Plan if no available plans and has active subscriptions */}
              {hasActiveSubscriptions() && getAvailablePlans().length === 0 && (
                <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-slate-900 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Professional</CardTitle>
                    <p className="text-slate-700">365 days</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold">$48/month</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="bg-slate-900 text-white hover:bg-slate-800 flex-1"
                        onClick={handleUpgrade}
                      >
                        Upgrade
                      </Button>
                      <Button variant="ghost" className="text-slate-900 hover:bg-slate-100 flex-1">
                        Learn more
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Previous Subscriptions - Only show when no active subscriptions and button is clicked */}
            {!hasActiveSubscriptions() && showPreviousSubscriptions && getPreviousSubscriptions().length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Previous Subscriptions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPreviousSubscriptions().map((subscription) => (
                    <Card key={subscription.user_subscription_id} className="border border-slate-200 shadow-sm bg-slate-50">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-700">
                          {getPlanDisplayName(subscription.subscription.plan_type)}
                        </CardTitle>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-500">
                            {subscription.subscription.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}
                          </p>
                          <p className="text-xs text-slate-400">
                            Created: {formatDate(subscription.created_at)}
                          </p>
                          {subscription.end_date && (
                            <p className="text-xs text-slate-400">
                              Ended: {formatDate(subscription.end_date)}
                            </p>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Status:</span>
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              Inactive
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Price:</span>
                            <span className="text-sm font-medium text-slate-700">
                              {subscription.subscription.billing_cycle === 'yearly' 
                                ? `${formatCurrency(getDisplayPrice(subscription))}/year`
                                : `${formatCurrency(getDisplayPrice(subscription))}/month`
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Credits Used:</span>
                            <span className="text-sm text-slate-700">
                              {subscription.credits_used || 0} / {subscription.credits_allocated || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show More/Less Button - Only show if there are active subscriptions */}
            {hasActiveSubscriptions() && getRemainingPlansCount() > 0 && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAllPlans(!showAllPlans)}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  {showAllPlans 
                    ? `Show Less` 
                    : `Show More (${getRemainingPlansCount()} more)`
                  }
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auto Renew Section */}
        {/* <Card className="border border-slate-200 shadow-sm backdrop-blur-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-white">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Auto Renewal Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-between p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex-1">
                <p className="text-slate-700">
                  This option; if checked, will renew your productive subscription, if the current plan expires. 
                  However, this might prevent you from downgrading to a lower plan.
                </p>
              </div>
              <Switch
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
                className="ml-4"
              />
            </div>
          </CardContent>
        </Card> */}

        {/* Payment Method Section */}
        {/* <Card className="border border-slate-200 shadow-sm backdrop-blur-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-white">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <Card key={method.payment_method_id} className={`relative ${method.is_default ? 'border-2 border-yellow-200 shadow-lg' : 'border-slate-200'}`}>
                  {method.is_default && (
                    <div className="absolute top-4 right-4">
                      <Check className="w-5 h-5 text-yellow-600" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {method.method_type.replace('_', ' ')}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-red-600">
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        {getCardBrandIcon(method.card_brand)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">**** **** ****{method.card_last_four}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-2 border-dashed border-yellow-300 hover:border-yellow-400 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-center h-full">
                  <div className="text-center">
                    <Plus className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Add Payment Method</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card> */}

        {/* Billing History Section */}
        <Card className="border border-slate-200 shadow-sm backdrop-blur-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-white">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-yellow-50">
                  <TableHead className="font-semibold text-slate-900">DATE</TableHead>
                  <TableHead className="font-semibold text-slate-900">DETAILS</TableHead>
                  <TableHead className="font-semibold text-slate-900">AMOUNT</TableHead>
                  <TableHead className="font-semibold text-slate-900">DOWNLOAD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((payment) => {
                    const subscription = getSubscriptionById(payment.subscription_id);
                    return (
                      <TableRow key={payment.payment_id} className="hover:bg-slate-50">
                        <TableCell className="text-slate-700">
                          {formatDate(payment.created_at)}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {subscription 
                            ? `${getPlanDisplayName(subscription.subscription.plan_type)} plan, ${subscription.subscription.billing_cycle}`
                            : 'Unknown plan'
                          }
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-400">Currently unavailable</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                      No payment history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Cancel Subscription
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-slate-700 text-sm">
                Are you sure you want to cancel your <strong>{getPlanDisplayName(getCurrentSubscription()?.subscription.plan_type || '')}</strong> subscription?
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>You will lose access to premium features immediately</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Your remaining credits will be forfeited</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>You can resubscribe anytime from the pricing page</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={cancelCancellation}
              disabled={cancelling}
              className="flex-1"
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancellation}
              disabled={cancelling}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {cancelling ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancelling...
                </div>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
