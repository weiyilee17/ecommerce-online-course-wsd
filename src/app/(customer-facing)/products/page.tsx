import ProductCard, { ProductCardSkeleton } from '@/components/product-card';
import db from '@/db/db';
import { Suspense } from 'react';

async function getProducts() {
  wait(2000);
  return db.product.findMany({
    where: {
      isAvailableForPurchase: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function ProductsPage() {
  return (
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
        <ProductsSuspense />
      </Suspense>
    </div>
  );
}

async function ProductsSuspense() {
  const products = await getProducts();

  return products.map((product) => (
    <ProductCard
      key={product.id}
      {...product}
    />
  ));
}

export default ProductsPage;
