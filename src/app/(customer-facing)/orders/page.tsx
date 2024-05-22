'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { emailOrderHistory } from '@/actions/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function MyOrdersPage() {
  const [data, dispatch] = useFormState(emailOrderHistory, {});

  return (
    <form
      action={dispatch}
      className='max-w-2xl mx-auto'
    >
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            Enter your email and we will email you your order history and download links
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className='space-y-2'>
            <Label htmlFor='id'>Email</Label>
            <Input
              type='email'
              required
              name='email'
              id='email'
            />
            {data.error && <div className='text-destructive'>{data.error}</div>}
          </div>
        </CardContent>

        <CardFooter>{data.message ? <p>{data.message}</p> : <SubmitButton />}</CardFooter>
      </Card>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className='w-full'
      size='lg'
      disabled={pending}
      type='submit'
    >
      {pending ? 'Sending...' : 'Send'}
    </Button>
  );
}

export default MyOrdersPage;
