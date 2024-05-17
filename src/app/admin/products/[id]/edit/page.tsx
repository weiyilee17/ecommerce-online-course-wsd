import db from '@/db/db';
import PageHeader from '../../../_components/page-header';
import ProductForm from '../../_components/product-form';

async function EditProductPage({ params: { id } }: { params: { id: string } }) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
  });

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  );
}

export default EditProductPage;
