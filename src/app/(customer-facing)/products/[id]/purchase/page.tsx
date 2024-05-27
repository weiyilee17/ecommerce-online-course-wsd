import { notFound } from 'next/navigation';
import React from 'react';

import db from '@/db/db';
import { usableDiscountCodeWhere } from '@/lib/discount-code-helpers';

import CheckoutForm from './_components/checkout-form';

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

  return (
    <CheckoutForm
      product={product}
      discountCode={discountCode}
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
