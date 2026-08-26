import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
const LOCAL_REFRESH_PATH = '/api/admin/refresh';

export async function middleware(request: NextRequest) {
  let token = request.cookies.get('access_token')?.value;
  const refresh = request.cookies.get('refresh_token')?.value;
  const { pathname } = request.nextUrl;
  const secureFlag = process.env.NODE_ENV === 'production';

  // Protect routes
  const studentProtectedRoutes = ['/', '/courses', '/transcript', '/profile'];
  const isStudentRoute = studentProtectedRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );
  const isAdminRoute = pathname.startsWith('/admin');

  const isProtectedRoute = isStudentRoute || isAdminRoute;

  // If not a protected route, and not /login, just allow
  if (!isProtectedRoute && pathname !== '/login') {
    return NextResponse.next();
  }

  let resp = NextResponse.next();
  let tokenRefreshed = false;

  // If protected route and no access token, try refreshing
  if (isProtectedRoute && !token) {
    if (!refresh) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    try {
      // Call local refresh route which returns new tokens (reads refresh cookie server-side)
      const refreshRes = await fetch(new URL(LOCAL_REFRESH_PATH, request.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!refreshRes.ok) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      const refreshData = await refreshRes.json();
      token = refreshData.access;
      tokenRefreshed = true;

      if (refreshData.access) {
        resp.cookies.set('access_token', refreshData.access, {
          httpOnly: true,
          secure: secureFlag,
          path: '/',
          maxAge: 15 * 60,
        });
      }
      if (refreshData.refresh) {
        resp.cookies.set('refresh_token', refreshData.refresh, {
          httpOnly: true,
          secure: secureFlag,
          path: '/',
          maxAge: 14 * 24 * 60 * 60,
        });
      }
    } catch (err) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // If we have a token (either existing or just refreshed), verify role
  if (token) {
    try {
      const meRes = await fetch(BACKEND_URL + '/accounts/api/me/', {
        headers: { Authorization: 'Bearer ' + token },
        cache: 'no-store',
      });

      // If token expired despite being present (e.g. 401), we can try one more refresh here
      // But for simplicity, we assume token is valid or we just fail to login
      if (meRes.ok) {
        const userData = await meRes.json();
        
        // Handle /login redirection for authenticated users
        if (pathname === '/login') {
          const url = request.nextUrl.clone();
          url.pathname = userData.is_superuser ? '/admin' : '/';
          return NextResponse.redirect(url);
        }

        // Handle protected route role checks
        if (isAdminRoute && !userData.is_superuser) {
           const url = request.nextUrl.clone();
           url.pathname = '/';
           return NextResponse.redirect(url);
        }

        if (isStudentRoute && !userData.is_student) {
           const url = request.nextUrl.clone();
           url.pathname = '/admin';
           return NextResponse.redirect(url);
        }

        return resp; // allow access (with potentially updated cookies)
      } else if (!tokenRefreshed && refresh && isProtectedRoute) {
        // Edge case: we had a token, but it was invalid, and we haven't tried refreshing yet
        const refreshRes = await fetch(new URL(LOCAL_REFRESH_PATH, request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          resp.cookies.set('access_token', refreshData.access, {
            httpOnly: true, secure: secureFlag, path: '/', maxAge: 15 * 60,
          });
          if (refreshData.refresh) {
            resp.cookies.set('refresh_token', refreshData.refresh, {
              httpOnly: true, secure: secureFlag, path: '/', maxAge: 14 * 24 * 60 * 60,
            });
          }
          
          // Verify again
          const meRes2 = await fetch(BACKEND_URL + '/accounts/api/me/', {
            headers: { Authorization: 'Bearer ' + refreshData.access },
            cache: 'no-store',
          });

          if (meRes2.ok) {
            const userData2 = await meRes2.json();
            if (isAdminRoute && !userData2.is_superuser) {
               const url = request.nextUrl.clone();
               url.pathname = '/';
               return NextResponse.redirect(url);
            }
            if (isStudentRoute && !userData2.is_student) {
               const url = request.nextUrl.clone();
               url.pathname = '/admin';
               return NextResponse.redirect(url);
            }
            return resp;
          }
        }
      }

      // If we fall through to here, verification completely failed
      if (isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

    } catch (err) {
      if (isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    }
  }

  // If we reach here, we are on /login with no token, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
