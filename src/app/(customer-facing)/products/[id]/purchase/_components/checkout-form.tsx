'use client';

import Image from 'next/image';
import { FormEvent, useRef, useState } from 'react';

import { userOrderExists } from '@/app/actions/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDiscountCode } from '@/lib/formatters';
import { Product } from '@prisma/client';
import { Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getDiscountCode } from '../page';
import { getDiscountedAmount } from '@/lib/discount-code-helpers';

type CheckoutFormProps = {
  product: Product;
  discountCode?: Awaited<ReturnType<typeof getDiscountCode>>;
  clientSecret: string;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

function CheckoutForm({ clientSecret, product, discountCode }: CheckoutFormProps) {
  const amount = !discountCode
    ? product.priceInCents
    : getDiscountedAmount(discountCode?.discountAmount, discountCode?.discountType, product.priceInCents);
  const disCountApplied = amount !== product.priceInCents;

  return (
    <div className='max-w-5xl w-full mx-auto space-y-8'>
      <div className='flex gap-4 items-center'>
        <div className='aspect-video flex- shrink-0 relative w-1/3'>
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className='object-cover'
          />
        </div>
        <div>
          <div className='text-lg flex gap-4 items-baseline'>
            <div className={disCountApplied ? 'line-through text-muted-foreground text-sm' : ''}>
              {formatCurrency(product.priceInCents / 100)}
            </div>
            {disCountApplied && <div className='text-lg'>{formatCurrency(amount / 100)}</div>}
          </div>

          <h1 className='text-2xl font-bold'>{product.name}</h1>
          <div className='line-clamp-3 text-muted-foreground'>{product.description}</div>
        </div>
      </div>
      <Elements
        options={{ clientSecret }}
        stripe={stripePromise}
      >
        <Form
          priceInCents={product.priceInCents}
          id={product.id}
          discountCode={discountCode}
        />
      </Elements>
    </div>
  );
}

function Form({
  priceInCents,
  id: productId,
  discountCode,
}: Pick<Product, 'priceInCents' | 'id'> & Pick<CheckoutFormProps, 'discountCode'>) {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState<string>();

  const discountCodeRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const coupon = searchParams.get('coupon');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!stripe || !elements || !email) {
      return;
    }

    setIsLoading(true);

    // Check if existing order
    const orderExists = await userOrderExists(email, productId);

    if (orderExists) {
      setErrorMessage('You have already purchased this product. Try downloading it from the My Orders page.');
      setIsLoading(false);
      return;
    }

    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('An unknown error occurred');
        }
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription className='text-destructive'>
            {errorMessage && <div>{errorMessage}</div>}
            {coupon && !discountCode && <div>Invalid discount code</div>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement />

          <div className='mt-4'>
            <LinkAuthenticationElement onChange={(e) => setEmail(e.value.email)} />
          </div>

          <div className='space-y-2 mt-4'>
            <Label htmlFor='discountCode'>Coupon</Label>
            <div className='flex gap-4 items-center'>
              <Input
                id='discountCode'
                type='text'
                name='discountCode'
                className='max-w-xs w-full'
                ref={discountCodeRef}
                defaultValue={coupon ?? ''}
              />

              <Button
                type='button'
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('coupon', discountCodeRef.current?.value ?? '');
                  router.push(`${pathname}?${params.toString()}`);
                }}
              >
                Apply
              </Button>

              {discountCode && (
                <div className='text-muted-foreground'>
                  {formatDiscountCode(discountCode.discountAmount, discountCode.discountType)} discount
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className='w-full'
            size='lg'
            // loading
            disabled={!stripe || !elements || isLoading}
          >
            {isLoading ? 'Purchasing...' : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default CheckoutForm;
