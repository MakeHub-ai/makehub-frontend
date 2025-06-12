'use client'

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/auth-context';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const PaymentForm = () => {
  const api = useApiClient();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handlePayment = async () => {
    if (!stripe || !elements || amount <= 0 || !user?.id) {
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
        amount
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
        setStatusMessage(`Payment successful! €${amount} has been added to your account.`);
        // Réinitialiser le montant après succès
        setAmount(0);
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
    <div className="space-y-6 max-w-md mx-auto p-6">

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (EUR)
        </label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter amount"
        />
      </div>

      {status !== 'idle' && (
        <div className={`p-4 rounded-lg ${
          status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {statusMessage}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center mb-4 text-gray-600">
          <LockClosedIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">Secure payment powered by Stripe</span>
        </div>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing || amount <= 0}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        <ShieldCheckIcon className="h-5 w-5 mr-2" />
        {isProcessing ? 'Processing...' : 'Confirm Payment'}
      </button>
    </div>
  );
};

export default function ReloadPage() {
  return (
    <div className="min-h-screen py-12 pt-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Add Credits to Your Account
          </h1>
          <p className="mt-2 text-gray-600">
            Purchase additional credits securely using our payment system
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">Protected by Stripe's secure payment system</p>
          <p>By proceeding with this payment, you agree to our{' '}
            <a href="/terms" className="text-indigo-600 hover:text-indigo-800">
              terms and conditions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
