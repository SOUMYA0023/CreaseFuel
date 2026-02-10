import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const privatePaths = ['/dashboard', '/profile', '/log'];
function isPrivate(pathname: string) {
  return privatePaths.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;
  if (isPrivate(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return Response.redirect(url);
  }
  if (pathname === '/' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return Response.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
