'use server';

import { Resend } from 'resend';
import Stripe from 'stripe';
import { z } from 'zod';

import db from '@/db/db';
import OrderHistoryEmail from '@/email/order-history';
import { getDiscountedAmount, usableDiscountCodeWhere } from '@/lib/discount-code-helpers';

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY as string);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get('email'));

  if (!result.success) {
    return { error: 'Invalid email address' };
  }

  const user = await db.user.findUnique({
    where: {
      email: result.data,
    },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  });

  // If send error, might allow people to easily spam APIs to check if email exists
  if (!user) {
    return {
      message: 'Check your email to view your order history and download your products.',
    };
  }

  const ordersWithVerification = user.orders.map(async (order) => ({
    ...order,
    downloadVerificationId: (
      await db.downloadVerification.create({
        data: { expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), productId: order.product.id },
      })
    ).id,
  }));

  const data = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: 'Order History',
    react: <OrderHistoryEmail orders={await Promise.all(ordersWithVerification)} />,
  });

  if (data.error) {
    return {
      error: 'There was an error sending your email. Please try again.',
    };
  }

  return {
    message: 'Check your email to view your order history and download your products.',
  };
}

export async function createPaymentIntent(email: string, productId: string, discountCodeId?: string) {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    return {
      error: 'Unexpected Error',
    };
  }

  const discountCode = !discountCodeId
    ? null
    : await db.discountCode.findUnique({
        where: {
          id: discountCodeId,
          ...usableDiscountCodeWhere(product.id),
        },
      });

  if (!discountCode && discountCodeId) {
    return {
      error: 'Coupon has expired',
    };
  }

  const existingOrder = await db.order.findFirst({
    where: {
      user: {
        email,
      },
      productId,
    },
    select: { id: true },
  });

  if (existingOrder) {
    return { error: 'You have already purchased this product. Try downloading it from the My Orders page.' };
  }

  const amount = !discountCode
    ? product.priceInCents
    : getDiscountedAmount(discountCode.discountAmount, discountCode.discountType, product.priceInCents);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'USD',
    // Tie up payment intent with product
    metadata: {
      productId: product.id,
      discountCodeId: discountCode?.id ?? null,
    },
  });

  if (!paymentIntent.client_secret) {
    return {
      error: 'Unknown error',
    };
  }

  return {
    clientSecret: paymentIntent.client_secret,
  };
}
