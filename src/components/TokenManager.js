'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import useUserStore from '../stores/userStore';
import { logUserPurchase } from '../lib/firebaseService';

const TOKEN_PACKAGES = [
  { 
    id: 'basic', 
    name: 'Basic Pack', 
    tokens: 100, 
    price: 9.99 
  },
  { 
    id: 'standard', 
    name: 'Standard Pack', 
    tokens: 500, 
    price: 29.99 
  },
  { 
    id: 'premium', 
    name: 'Premium Pack', 
    tokens: 1000, 
    price: 49.99 
  }
];

export default function TokenManager() {
  const { user } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (tokenPackage) => {
    if (!user) {
      alert('Please log in to purchase tokens');
      return;
    }

    setIsProcessing(true);

    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid,
          packageId: tokenPackage.id,
          tokens: tokenPackage.tokens,
          price: tokenPackage.price
        })
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (error) {
        console.error('Stripe Checkout Error:', error);
        alert('Failed to process payment');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to initiate purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Token Packages</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {TOKEN_PACKAGES.map((pkg) => (
          <div 
            key={pkg.id} 
            className="border rounded-lg p-4 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{pkg.name}</h3>
            <p className="text-gray-600">{pkg.tokens} Tokens</p>
            <p className="text-green-600 font-bold">${pkg.price}</p>
            <button
              onClick={() => handlePurchase(pkg)}
              disabled={isProcessing}
              className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
