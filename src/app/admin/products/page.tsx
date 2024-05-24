import React from 'react';
import PageHeader from '../_components/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import db from '@/db/db';
import { CheckCircle2, MoreVertical, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActiveToggleDropdownItem, DeleteDropdownItem } from './_components/product-actions';

function AdminProductsPage() {
  return (
    <>
      <div className='flex justify-between items-center gap-4'>
        <PageHeader>Products</PageHeader>
        {/* renders as link rather than as button */}
        <Button asChild>
          <Link href='/admin/products/new'>Add Product</Link>
        </Button>
      </div>
      <ProductsTable />
    </>
  );
}

export default AdminProductsPage;

async function ProductsTable() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  if (!products.length) {
    return <p>No products found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-0'>
            <span className='sr-only'>Avaiable for purchase</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className='w-0'>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map(({ id, isAvailableForPurchase, name, priceInCents, _count }) => (
          <TableRow key={id}>
            <TableCell>
              {isAvailableForPurchase ? (
                <>
                  <span className='sr-only'>Available</span>
                  <CheckCircle2 />
                </>
              ) : (
                <>
                  <span className='sr-only'>UnAvailable</span>
                  <XCircle className='stroke-destructive' />
                </>
              )}
            </TableCell>
            <TableCell>{name}</TableCell>
            <TableCell>{formatCurrency(priceInCents / 100)}</TableCell>
            <TableCell>{_count.orders}</TableCell>

            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className='sr-only'>Actions</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <a
                      download
                      href={`/admin/products/${id}/download`}
                    >
                      Download
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={`/admin/products/${id}/edit`}>Edit</Link>
                  </DropdownMenuItem>

                  <ActiveToggleDropdownItem
                    id={id}
                    isAvailableForPurchase={isAvailableForPurchase}
                  />

                  <DropdownMenuSeparator />

                  <DeleteDropdownItem
                    id={id}
                    disabled={_count.orders > 0}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
