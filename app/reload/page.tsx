'use client'

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/auth-context';
import { useExchangeRates } from '@/hooks/use-exchange-rates';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const PaymentForm = () => {
  const api = useApiClient();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { convertCurrency, loading: ratesLoading } = useExchangeRates();
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'eur' | 'usd'>('eur');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Helper function to get currency symbol
  const getCurrencySymbol = (curr: 'eur' | 'usd') => {
    return curr === 'eur' ? '€' : '$';
  };

  // Helper function to get currency display name
  const getCurrencyName = (curr: 'eur' | 'usd') => {
    return curr === 'eur' ? 'EUR' : 'USD';
  };

  const handlePayment = async () => {
    const numericAmount = parseFloat(amount);
    
    if (!stripe || !elements || !amount || numericAmount <= 0 || !user?.id) {
      setStatus('error');
      setStatusMessage('Please ensure you are logged in and have entered an amount');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');
    setStatusMessage('Processing payment...');

    try {
      // Add error handling for unauthorized requests
      const paymentIntent = await api.post('/api/stripe/create-payment-intent', {
        amount: numericAmount,
        currency
      }).catch(err => {
        if (err.response?.status === 401) {
          throw new Error('Unable to authenticate. Please ensure you are logged in.');
        }
        throw err;
      });

      const { clientSecret } = paymentIntent.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setStatus('error');
        setStatusMessage(result.error.message || 'Payment failed');
      } else {
        setStatus('success');
        setStatusMessage(`Payment successful! ${getCurrencySymbol(currency)}${numericAmount} has been added to your account.`);
        // Réinitialiser le montant après succès
        setAmount('');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setStatus('error');
      setStatusMessage(error.message || error.response?.data?.error || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Credits</h2>
            <p className="text-gray-600 text-sm">Choose your preferred currency and amount</p>
          </div>

          {/* Currency Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Currency
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`
                relative flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${currency === 'eur' 
                  ? 'border-gray-900 bg-gray-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                }
              `}>
                <input
                  type="radio"
                  name="currency"
                  value="eur"
                  checked={currency === 'eur'}
                  onChange={(e) => setCurrency(e.target.value as 'eur' | 'usd')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-xl mb-1">€</div>
                  <div className="text-sm font-medium text-gray-900">EUR</div>
                </div>
                {currency === 'eur' && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-gray-900 rounded-full"></div>
                )}
              </label>
              <label className={`
                relative flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${currency === 'usd' 
                  ? 'border-gray-900 bg-gray-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                }
              `}>
                <input
                  type="radio"
                  name="currency"
                  value="usd"
                  checked={currency === 'usd'}
                  onChange={(e) => setCurrency(e.target.value as 'eur' | 'usd')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-xl mb-1">$</div>
                  <div className="text-sm font-medium text-gray-900">USD</div>
                </div>
                {currency === 'usd' && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-gray-900 rounded-full"></div>
                )}
              </label>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                {getCurrencySymbol(currency)}
              </span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="0.00"
              />
            </div>
            
            {/* Currency Estimation - only show USD estimation when EUR is selected */}
            {amount && parseFloat(amount) > 0 && currency === 'eur' && (
              <div className="mt-2 text-sm text-gray-500">
                {ratesLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
                    Loading exchange rate...
                  </span>
                ) : (
                  (() => {
                    const numericAmount = parseFloat(amount);
                    const convertedAmount = convertCurrency(numericAmount, 'EUR', 'USD');
                    
                    if (convertedAmount) {
                      return (
                        <span>
                          ≈ ${convertedAmount} USD <span className="text-gray-400"></span>
                        </span>
                      );
                    }
                    
                    return <span className="text-gray-400">Exchange rate unavailable</span>;
                  })()
                )}
              </div>
            )}
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`mb-6 p-3 rounded-lg text-sm font-medium border ${
              status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
              status === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {statusMessage}
            </div>
          )}

          {/* Card Element */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Payment method
            </label>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center mb-3 text-gray-500">
                <LockClosedIcon className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">Secured by Stripe</span>
              </div>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1f2937',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      '::placeholder': {
                        color: '#9ca3af',
                      },
                    },
                    invalid: {
                      color: '#dc2626',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            {isProcessing ? 'Processing...' : `Pay ${getCurrencySymbol(currency)}${amount || '0.00'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ReloadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Add Credits</h1>
            <p className="text-gray-600 mt-1">Securely add credits to your account</p>
          </div>

          {/* Payment Form */}
          <Elements stripe={stripePromise}>
            <PaymentForm />
          </Elements>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center space-x-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <LockClosedIcon className="h-4 w-4 mr-1" />
                <span>Encrypted</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>PCI DSS compliant</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>SOC 2 certified</span>
            </div>
            <p className="text-xs text-gray-500">
              By proceeding, you agree to our{' '}
              <a href="/terms" className="text-gray-700 hover:text-gray-900 transition-colors">
                terms and conditions
              </a>
              {' '}and{' '}
              <a href="/policy" className="text-gray-700 hover:text-gray-900 transition-colors">
                privacy policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
