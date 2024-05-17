import type { PropsWithChildren } from 'react';

function PageHeader({ children }: PropsWithChildren) {
  return <h1 className='text-4xl mb-4'>{children}</h1>;
}

export default PageHeader;
