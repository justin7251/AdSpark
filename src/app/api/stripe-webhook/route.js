import { buffer } from 'micro';
import Stripe from 'stripe';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { logUserPurchase } from '../../lib/firebaseService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = getFirestore();

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const tokens = parseInt(session.metadata.tokens);
      const packageId = session.metadata.packageId;

      // Log the purchase in Firestore
      await logUserPurchase(userId, {
        packageId,
        tokens,
        price: session.amount_total / 100, // Convert back to dollars
        status: 'completed'
      });

      // Update user tokens (you'll need to implement this method)
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        tokens: tokens // This should be added to existing tokens
      });
    }

    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
