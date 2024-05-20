import { Nav, NavLink } from '@/components/nav';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

function CustomerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div>
      <Nav>
        <NavLink href='/'>Dashboard</NavLink>
        <NavLink href='/products'>Products</NavLink>
        <NavLink href='/orders'>My Orders</NavLink>
      </Nav>
      <div className='container my-6'>{children}</div>
    </div>
  );
}

export default CustomerLayout;
