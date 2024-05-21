import { MoreVertical } from 'lucide-react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import db from '@/db/db';
import { formatCurrency, formatNumber } from '@/lib/formatters';

import PageHeader from '../_components/page-header';
import { DeleteDropdownItem } from './_components/user-actions';

function getUsers() {
  return db.user.findMany({
    select: {
      id: true,
      email: true,
      orders: {
        select: { pricePaidInCents: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

function UsersPage() {
  return (
    <>
      <PageHeader>Customers</PageHeader>
      <UsersTable />
    </>
  );
}

async function UsersTable() {
  const users = await getUsers();

  if (!users.length) {
    return <p>No customers found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Value</TableHead>
          <TableHead className='w-0'>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.map(({ id, email, orders }) => (
          <TableRow key={id}>
            <TableCell>{email}</TableCell>
            <TableCell>{formatNumber(orders.length)}</TableCell>
            <TableCell>
              {formatCurrency(orders.reduce((sum, order) => sum + order.pricePaidInCents, 0) / 100)}
            </TableCell>
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

export default UsersPage;
