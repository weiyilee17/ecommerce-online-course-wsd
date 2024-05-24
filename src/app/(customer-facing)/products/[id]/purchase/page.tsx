import { notFound } from 'next/navigation';
import React from 'react';
import Stripe from 'stripe';

import db from '@/db/db';

import CheckoutForm from './_components/checkout-form';
import { usableDiscountCodeWhere } from '@/lib/discount-code-helpers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function PurchasePage({
  params: { id },
  searchParams: { coupon },
}: {
  params: { id: string };
  searchParams: { coupon?: string };
}) {
  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) {
    return notFound();
  }

  const discountCode = !coupon ? undefined : await getDiscountCode(coupon, product.id);

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
      discountCode={discountCode}
      clientSecret={paymentIntent.client_secret}
    />
  );
}

export function getDiscountCode(coupon: string, productId: string) {
  return db.discountCode.findUnique({
    where: {
      ...usableDiscountCodeWhere,
      code: coupon,
    },
    select: {
      id: true,
      discountAmount: true,
      discountType: true,
    },
  });
}

export default PurchasePage;
