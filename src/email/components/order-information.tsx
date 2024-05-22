import { formatCurrency, formatDate } from '@/lib/formatters';
import { Order, Product } from '@prisma/client';
import { Button, Column, Img, Row, Section, Text } from '@react-email/components';

type OrderInformationProps = {
  order: Pick<Order, 'id' | 'createdAt' | 'pricePaidInCents'>;
  product: Pick<Product, 'name' | 'imagePath' | 'description'>;
  downloadVerificationId: string;
};

function OrderInformation({ order, product, downloadVerificationId }: OrderInformationProps) {
  return (
    <>
      <Section>
        <Row>
          <Column>
            <Text className='mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4'>Order ID</Text>
            <Text className='mt-0 mr-4'>{order.id}</Text>
          </Column>
          <Column>
            <Text className='mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4'>Purchased On</Text>
            <Text className='mt-0 mr-4'>{formatDate(order.createdAt)}</Text>
          </Column>
          <Column>
            <Text className='mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4'>Price Paid</Text>
            <Text className='mt-0 mr-4'>{formatCurrency(order.pricePaidInCents / 100)}</Text>
          </Column>
        </Row>
      </Section>

      <Section className='border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4'>
        <Img
          width='100%'
          alt={product.name}
          src={`${process.env.NEXT_PUBLIC_SERVER_URL}${product.imagePath}`}
        />

        <Row className='mt-8'>
          <Column className='align-bottom'>
            <Text className='text-lg font-bold m-0 mr-4'>{product.name}</Text>
          </Column>
          <Column align='right'>
            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/products/download/${downloadVerificationId}`}
              className='bg-black text-white px-6 py-4 rounded text-lg'
            >
              Download
            </Button>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text className='text-gray-500 mb-0 line-clamp-4'>{product.description}</Text>
          </Column>
        </Row>
      </Section>
    </>
  );
}

export default OrderInformation;