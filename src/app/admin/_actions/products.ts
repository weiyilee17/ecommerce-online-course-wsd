'use server';

import fs from 'fs/promises';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import db from '@/db/db';

const fileSchema = z.instanceof(File, { message: 'Required' });
// if file is not empty, check whether it is image type
const imageSchema = fileSchema.refine((file) => file.size === 0 || file.type.startsWith('image/'));

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  // Preventing
  file: fileSchema.refine((file) => file.size > 0, 'Required'),
  image: imageSchema.refine((file) => file.size > 0, 'Required'),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const { data } = result;

  await fs.mkdir('products', { recursive: true });
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  await fs.mkdir('public/products', { recursive: true });
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()));

  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  redirect('/admin/products');
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});

export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const { data } = result;
  const targetProduct = await db.product.findUnique({ where: { id } });

  if (!targetProduct) {
    return notFound();
  }

  let filePath = targetProduct.filePath;

  // if user uploaded a file to update
  if (data.file && data.file.size > 0) {
    await fs.unlink(targetProduct.filePath);
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }

  let imagePath = targetProduct.imagePath;

  // if user uploaded a image to update
  if (data.image && data.image.size > 0) {
    await fs.unlink(`public${targetProduct.imagePath}`);
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()));
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  redirect('/admin/products');
}

export async function toggleProductAvailability(id: string, isAvailableForPurchase: boolean) {
  await db.product.update({
    where: { id },
    data: {
      isAvailableForPurchase,
    },
  });
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({
    where: { id },
  });

  if (!product) {
    return notFound();
  }

  // deletes file
  await fs.unlink(product.filePath);
  await fs.unlink(`public${product.imagePath}`);
}
