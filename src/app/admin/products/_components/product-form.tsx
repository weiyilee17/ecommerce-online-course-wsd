'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/formatters';
import { Product } from '@prisma/client';

import { addProduct, updateProduct } from '../../_actions/products';

function ProductForm({ product }: { product?: Product | null }) {
  const [priceInCents, setPriceInCents] = useState<number | undefined>(product?.priceInCents);

  const [error, dispatch] = useFormState(!product ? addProduct : updateProduct.bind(null, product.id), {});

  return (
    <form
      action={dispatch}
      className='space-y-8'
    >
      <div className='space-y-2'>
        <Label htmlFor='name'>Name</Label>
        <Input
          type='text'
          id='name'
          name='name'
          required
          defaultValue={product?.name ?? ''}
        />
        {error.name && <div className='text-destructive'>{error.name}</div>}
      </div>

      {/* TODO: this has warning about controlled and uncontrolled components */}
      <div className='space-y-2'>
        <Label htmlFor='priceInCents'>Price In Cents</Label>
        <Input
          type='number'
          id='priceInCents'
          name='priceInCents'
          required
          value={priceInCents}
          onChange={(e) => setPriceInCents(+e.target.value)}
        />
        <div className='text-muted-foreground'>{formatCurrency((priceInCents ?? 0) / 100)}</div>
        {error.priceInCents && <div className='text-destructive'>{error.priceInCents}</div>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          name='description'
          required
          defaultValue={product?.description ?? ''}
        />
        {error.description && <div className='text-destructive'>{error.description}</div>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='file'>File</Label>
        <Input
          type='file'
          id='file'
          name='file'
          required={!product}
        />
        {product && <div className='text-muted-foreground'>{product.filePath}</div>}
        {error.file && <div className='text-destructive'>{error.file}</div>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='image'>Image</Label>
        <Input
          type='file'
          id='image'
          name='image'
          required={!product}
        />
        {product && (
          <Image
            src={product.imagePath}
            height='400'
            width='400'
            alt='Product Image'
          />
        )}

        {error.image && <div className='text-destructive'>{error.image}</div>}
      </div>

      <SubmitButton />
    </form>
  );
}

export default ProductForm;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type='submit'
      disabled={pending}
    >
      {pending ? 'Saving...' : 'Save'}
    </Button>
  );
}
