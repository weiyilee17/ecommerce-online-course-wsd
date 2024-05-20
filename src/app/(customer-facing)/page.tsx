import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import ProductCard, { ProductCardSkeleton } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import db from '@/db/db';
import { Product } from '@prisma/client';
import ProductsPage from './products/page';
import { cache } from '@/lib/cache';

const getMostPopularProducts = cache(
  () => {
    // await wait(1000);
    return db.product.findMany({
      where: {
        isAvailableForPurchase: true,
      },
      orderBy: {
        orders: {
          _count: 'desc',
        },
      },
      take: 6,
    });
  },
  ['/', 'getMostPopularProducts'],
  {
    revalidate: 60 * 60 * 24,
  }
);

const getNewestProducts = cache(() => {
  // await wait(2000);
  return db.product.findMany({
    where: {
      isAvailableForPurchase: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
}, ['/', 'getNewestProducts']);

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function HomePage() {
  return (
    <main className='space-y-12'>
      <ProductGridSection
        title='Most Popular'
        productsFetcher={getMostPopularProducts}
      />
      <ProductGridSection
        title='Newest'
        productsFetcher={getNewestProducts}
      />
    </main>
  );
}

type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<Product[]>;
};

function ProductGridSection({ title, productsFetcher }: ProductGridSectionProps) {
  return (
    <div className='space-y-4'>
      <div className='flex gap-4'>
        <h2 className='text-3xl font-bold'>{title}</h2>
        <Button
          asChild
          variant='outline'
        >
          <Link
            href='/products'
            className='space-x-2 '
          >
            <span>View All</span>
            <ArrowRight className='size-4' />
          </Link>
        </Button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductSuspense({ productsFetcher }: Pick<ProductGridSectionProps, 'productsFetcher'>) {
  return (await productsFetcher()).map((product) => (
    <ProductCard
      key={product.id}
      {...product}
    />
  ));
}

export default HomePage;
