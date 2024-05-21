import { notFound } from 'next/navigation';
import React from 'react';
import Stripe from 'stripe';

import db from '@/db/db';

import CheckoutForm from './_components/checkout-form';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function PurchasePage({ params: { id } }: { params: { id: string } }) {
  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) {
    return notFound();
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: 'USD',
    // Tie up payment intent with product
    metadata: {
      productId: product.id,
    },
  });

  if (!paymentIntent.client_secret) {
    throw Error('Strip failed to create payment intent.');
  }

  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntent.client_secret}
    />
  );
}

export default PurchasePage;
