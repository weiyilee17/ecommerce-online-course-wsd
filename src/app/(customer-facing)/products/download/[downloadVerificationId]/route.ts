import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

import db from '@/db/db';

export async function GET(
  req: NextRequest,
  { params: { downloadVerificationId } }: { params: { downloadVerificationId: string } }
) {
  const data = await db.downloadVerification.findUnique({
    where: {
      id: downloadVerificationId,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      product: {
        select: {
          filePath: true,
          name: true,
        },
      },
    },
  });

  if (!data) {
    return NextResponse.redirect(new URL('/products/download/expired', req.url));
  }

  const { product } = data;

  const { size } = await fs.stat(product.filePath);
  const file = await fs.readFile(product.filePath);
  const extension = product.filePath.split('.').pop();

  return new NextResponse(file, {
    headers: {
      'Content-Disposition': `attachment; filename="${product.name}.${extension}"`,
      'Content-Length': size.toString(),
    },
  });
}
