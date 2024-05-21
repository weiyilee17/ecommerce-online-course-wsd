import Link from 'next/link';

import { Button } from '@/components/ui/button';

function ExpiredPage() {
  return (
    <>
      <h1 className=''>Download link expired</h1>
      <Button
        asChild
        size='lg'
      >
        <Link href='/orders'>Get New Link</Link>
      </Button>
    </>
  );
}

export default ExpiredPage;
