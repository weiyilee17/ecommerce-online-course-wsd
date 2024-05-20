import { NextResponse, type NextRequest } from 'next/server';
import { isValidPassword } from './lib/is-valid-password';

export async function middleware(req: NextRequest) {
  if ((await isAuthenticated(req)) === false) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic',
      },
    });
  }
}
async function isAuthenticated(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

  if (!authHeader) {
    return false;
  }

  // authHeader is something like 'Basic asfdasdfasdf'
  // after decoded, is something like 'username:password'

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

  return (
    username === process.env.ADMIN_USERNAME &&
    (await isValidPassword(password, process.env.ADMIN_HASHED_PASSWORD as string))
  );
}

export const config = {
  matcher: '/admin/:path*',
};
