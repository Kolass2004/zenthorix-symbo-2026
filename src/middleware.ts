import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // We want to redirect all public pages to the "/completed" page.
  // We allow /admin, /api, /_next, static files, and the /completed page itself.
  if (
    path.startsWith('/admin') || 
    path.startsWith('/api') || 
    path.startsWith('/_next') || 
    path.includes('.') || 
    path === '/completed'
  ) {
    return NextResponse.next();
  }

  // Redirect everything else (like / and /offline-registrations) to /completed
  return NextResponse.redirect(new URL('/completed', request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
