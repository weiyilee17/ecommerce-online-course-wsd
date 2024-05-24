import { Minus, MoreVertical } from 'lucide-react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import db from '@/db/db';
import { formatCurrency } from '@/lib/formatters';

import PageHeader from '../_components/page-header';
import { DeleteDropdownItem } from './_components/order-actions';

function getOrders() {
  return db.order.findMany({
    select: {
      id: true,
      pricePaidInCents: true,
      product: {
        select: { name: true },
      },
      user: { select: { email: true } },
      discountCode: { select: { code: true } },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

function OrdersPage() {
  return (
    <>
      <PageHeader>Sales</PageHeader>
      <OrdersTable />
    </>
  );
}

async function OrdersTable() {
  const orders = await getOrders();

  if (!orders.length) {
    return <p>No sales found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Price Paid</TableHead>
          <TableHead>Coupon</TableHead>
          <TableHead className='w-0'>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {orders.map(({ id, product, user, pricePaidInCents, discountCode }) => (
          <TableRow key={id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{formatCurrency(pricePaidInCents / 100)}</TableCell>
            <TableCell>{!discountCode ? <Minus /> : discountCode.code}</TableCell>
            <TableCell className='text-center'>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className='sr-only'>Actions</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DeleteDropdownItem id={id} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default OrdersPage;
