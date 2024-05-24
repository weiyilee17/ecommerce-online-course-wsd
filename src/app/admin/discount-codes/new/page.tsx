import db from '@/db/db';
import PageHeader from '../../_components/page-header';
import DiscountCodeForm from '../_components/discount-code-form';

async function NewDiscountCodePage() {
  const products = await db.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <>
      <PageHeader>Add Discount Code</PageHeader>
      <DiscountCodeForm products={products} />
    </>
  );
}

export default NewDiscountCodePage;
