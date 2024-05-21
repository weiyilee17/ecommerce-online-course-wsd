import { Order, Product } from '@prisma/client';
import { Body, Container, Head, Heading, Html, Preview, Tailwind } from '@react-email/components';

import OrderInformation from './components/order-information';

export type PurchaseReceiptEmailProps = {
  product: Product;
  order: Order;
  downloadVerificationId: string;
};

PurchaseReceiptEmail.PreviewProps = {
  product: {
    name: 'product name',
    description: 'Some description',
    imagePath: '/products/6e492281-fb68-4749-b960-d035461c8e06-test_image.png',
  },
  order: {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    pricePaidInCents: 10_000,
  },
};

function PurchaseReceiptEmail({ product, order, downloadVerificationId }: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Preview>Download {product.name} and view receipt</Preview>
      <Tailwind>
        <Head />
        <Body className='font-sans bg-white'>
          <Container className='max-w-xl'>
            <Heading>Purchase Receipt</Heading>
            <OrderInformation
              product={product}
              order={order}
              downloadVerificationId={downloadVerificationId}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PurchaseReceiptEmail;
