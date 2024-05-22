import React from 'react';

import { Order, Product } from '@prisma/client';
import { Body, Container, Head, Heading, Hr, Html, Preview, Tailwind } from '@react-email/components';

import OrderInformation from './components/order-information';

type OrderHistoryProps = {
  orders: (Pick<Order, 'id' | 'createdAt' | 'pricePaidInCents'> & {
    product: Pick<Product, 'name' | 'imagePath' | 'description'>;
    downloadVerificationId: string;
  })[];
};

OrderHistoryEmail.PreviewProps = {
  orders: [
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      pricePaidInCents: 10_000,
      downloadVerificationId: crypto.randomUUID(),
      product: {
        name: 'product name',
        description: 'Some description',
        imagePath: '/products/6e492281-fb68-4749-b960-d035461c8e06-test_image.png',
      },
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      pricePaidInCents: 2_000,
      downloadVerificationId: crypto.randomUUID(),
      product: {
        name: 'product name 2',
        description: 'Some other description',
        imagePath: '/products/cf2ef892-fba1-46a0-89ad-a957e45eca8a-æªå 2021-03-10 ä¸å4.39.05.png',
      },
    },
  ],
};

function OrderHistoryEmail({ orders }: OrderHistoryProps) {
  return (
    <Html>
      <Preview>Order History & Downloads</Preview>
      <Tailwind>
        <Head />
        <Body className='font-sans bg-white'>
          <Container className='max-w-xl'>
            <Heading>Order History</Heading>
            {orders.map((order, index) => (
              <React.Fragment key={index}>
                <OrderInformation
                  order={order}
                  product={order.product}
                  downloadVerificationId={order.downloadVerificationId}
                />

                {index < orders.length - 1 && <Hr />}
              </React.Fragment>
            ))}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default OrderHistoryEmail;
