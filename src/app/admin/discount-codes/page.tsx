import { CheckCircle2, Globe, Infinity, Minus, MoreVertical, XCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import db from '@/db/db';
import { formatCurrency, formatDateTime, formatDiscountCode, formatNumber } from '@/lib/formatters';
import { Prisma } from '@prisma/client';

import PageHeader from '../_components/page-header';
import { ActiveToggleDropdownItem, DeleteDropdownItem } from './_components/discount-code-actions';

const WHERE_EXPIRED: Prisma.DiscountCodeWhereInput = {
  OR: [
    {
      limit: {
        not: null,
        lte: db.discountCode.fields.uses,
      },
    },
    {
      expiresAt: { not: null, lte: new Date() },
    },
  ],
};

const SELECT_FIELDS: Prisma.DiscountCodeSelect = {
  id: true,
  allProducts: true,
  code: true,
  discountAmount: true,
  discountType: true,
  expiresAt: true,
  limit: true,
  uses: true,
  isActive: true,
  products: { select: { name: true } },
  _count: { select: { orders: true } },
};

function getExpiredDiscountCodes() {
  return db.discountCode.findMany({
    select: SELECT_FIELDS,
    where: WHERE_EXPIRED,
    orderBy: { createdAt: 'asc' },
  });
}

function getUnexpiredDiscountCodes() {
  return db.discountCode.findMany({
    select: SELECT_FIELDS,
    where: { NOT: WHERE_EXPIRED },
    orderBy: { createdAt: 'asc' },
  });
}

async function DiscountCodesPage() {
  const [expiredDiscountCodes, unexpiredDiscountCodes] = await Promise.all([
    getExpiredDiscountCodes(),
    getUnexpiredDiscountCodes(),
  ]);

  return (
    <>
      <div className='flex justify-between items-center gap-4'>
        <PageHeader>Couponds</PageHeader>
        {/* renders as link rather than as button */}
        <Button asChild>
          <Link href='/admin/discount-codes/new'>Add Coupond</Link>
        </Button>
      </div>

      <DiscountCodesTable
        discountCodes={unexpiredDiscountCodes}
        canDeactivate
      />

      <div className='mt-8'>
        <h2 className='text-xl font-bold'>Expired Coupons</h2>
        <DiscountCodesTable
          discountCodes={expiredDiscountCodes}
          isInactive
        />
      </div>
    </>
  );
}

type DiscountCodesTableProps = {
  discountCodes: Awaited<ReturnType<typeof getUnexpiredDiscountCodes>>;
  isInactive?: boolean;
  canDeactivate?: boolean;
};

function DiscountCodesTable({ discountCodes, isInactive = false, canDeactivate = false }: DiscountCodesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-0'>
            <span className='sr-only'>Is Active</span>
          </TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Remaining Uses</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Products</TableHead>
          <TableHead className='w-0'>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {discountCodes.map(
          ({
            id,
            isActive,
            code,
            discountAmount,
            discountType,
            expiresAt,
            limit,
            uses,
            _count,
            allProducts,
            products,
          }) => (
            <TableRow key={id}>
              <TableCell>
                {/* The naming is confusing, but this logic is for expired couponds, always show Inactive */}
                {isActive && !isInactive ? (
                  <>
                    <span className='sr-only'>Active</span>
                    <CheckCircle2 />
                  </>
                ) : (
                  <>
                    <span className='sr-only'>Inactive</span>
                    <XCircle className='stroke-destructive' />
                  </>
                )}
              </TableCell>
              <TableCell>{code}</TableCell>
              <TableCell>{formatDiscountCode(discountAmount, discountType)}</TableCell>
              <TableCell>{!expiresAt ? <Minus /> : formatDateTime(expiresAt)}</TableCell>
              <TableCell>{!limit ? <Infinity /> : formatNumber(limit - uses)}</TableCell>
              <TableCell>{formatNumber(_count.orders)}</TableCell>
              <TableCell>{allProducts ? <Globe /> : products.map(({ name }) => name).join(',  ')}</TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical />
                    <span className='sr-only'>Actions</span>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {canDeactivate && (
                      <>
                        <ActiveToggleDropdownItem
                          id={id}
                          isActive={isActive}
                        />

                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DeleteDropdownItem
                      id={id}
                      disabled={_count.orders > 0}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
}

export default DiscountCodesPage;
