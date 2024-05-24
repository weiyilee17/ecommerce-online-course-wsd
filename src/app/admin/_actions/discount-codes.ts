'use server';

import db from '@/db/db';
import { DiscountCodeType } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

const addSchema = z
  .object({
    code: z.string().min(1),
    discountAmount: z.coerce.number().int().min(1),
    discountType: z.nativeEnum(DiscountCodeType),
    allProducts: z.coerce.boolean(),
    productIds: z.array(z.string()).optional(),
    expiresAt: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.date().min(new Date()).optional()),
    limit: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().int().min(1).optional()),
  })
  .refine((data) => data.discountAmount <= 100 || data.discountType !== DiscountCodeType.PERCENTAGE, {
    path: ['discountAmount'],
    message: 'Percentage discount must be less than or equal to 100',
  })
  .refine((data) => !data.allProducts || !data.productIds?.length, {
    path: ['productIds'],
    message: 'Cannot select products when all products is selected',
  })
  .refine((data) => data.allProducts || data.productIds?.length, {
    path: ['productIds'],
    message: 'Must select products when all products is not selected',
  });

export async function addDiscountCode(prevState: unknown, formData: FormData) {
  const formProductIds = formData.getAll('productIds');

  // Can't directly use Object.fromEntries, because array of productIds is only going to use 1 product instead of multiple products
  const result = addSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    productIds: formProductIds.length ? formProductIds : undefined,
  });

  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const { productIds, ...rest } = result.data;

  await db.discountCode.create({
    data: {
      ...rest,
      products: productIds?.length
        ? {
            connect: productIds.map((id) => ({ id })),
          }
        : undefined,
    },
  });

  redirect('/admin/discount-codes');
}

export async function toggleDiscountCodeActive(id: string, isActive: boolean) {
  await db.discountCode.update({ where: { id }, data: { isActive } });
}

export async function deleteDiscountCode(id: string) {
  const discountCode = await db.discountCode.delete({ where: { id } });

  if (!discountCode) {
    return notFound();
  }

  return discountCode;
}
