import db from '@/db/db';
import { DiscountCodeType, Prisma } from '@prisma/client';

export function usableDiscountCodeWhere(productId: string) {
  return {
    isActive: true,
    AND: [
      {
        // all products is true, or product id is in the list of products
        OR: [{ allProducts: true }, { products: { some: { id: productId } } }],
      },
      {
        OR: [{ limit: null }, { limit: { gt: db.discountCode.fields.uses } }],
      },
      {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    ],
  } satisfies Prisma.DiscountCodeWhereInput;
}

export function getDiscountedAmount(discountAmount: number, discountType: DiscountCodeType, priceInCents: number) {
  switch (discountType) {
    case DiscountCodeType.PERCENTAGE:
      // limitation of stripe
      return Math.max(5, Math.ceil(priceInCents - (priceInCents * discountAmount) / 100));

    case DiscountCodeType.FIXED:
      return Math.max(50, Math.ceil(priceInCents - discountAmount * 100));

    default:
      throw new Error(`Invalid discount type ${discountType satisfies never}`);
  }
}
