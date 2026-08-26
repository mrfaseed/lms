import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(req: Request) {
  const cookieStore = cookies();
  const access = cookieStore.get('access_token')?.value;
  const refresh = cookieStore.get('refresh_token')?.value;

  const url = new URL(req.url);
  const page = url.searchParams.get('page') || '1';
  const page_size = url.searchParams.get('page_size') || '10';
  const q = url.searchParams.get('q') || '';

  const backendUrl = `${BACKEND_URL}/accounts/api/admin/users/?page=${encodeURIComponent(page)}&page_size=${encodeURIComponent(page_size)}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

  try {
    const res = await fetch(backendUrl, {
      headers: access ? { Authorization: 'Bearer ' + access } : {},
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Try refresh by calling local refresh endpoint
    if ((res.status === 401 || res.status === 403) && refresh) {
      const refreshRes = await fetch(new URL('/api/admin/refresh', req.url).toString(), { method: 'POST', cache: 'no-store' });
      if (!refreshRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const refreshData = await refreshRes.json();
      const usersRes = await fetch(backendUrl, {
        headers: { Authorization: 'Bearer ' + refreshData.access },
        cache: 'no-store',
      });

      if (!usersRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const data = await usersRes.json();
      const resp = NextResponse.json(data);

      // Update cookies on client
      if (refreshData.access) resp.cookies.set('access_token', refreshData.access, { httpOnly: true, path: '/', maxAge: 15 * 60, secure: process.env.NODE_ENV === 'production' });
      if (refreshData.refresh) resp.cookies.set('refresh_token', refreshData.refresh, { httpOnly: true, path: '/', maxAge: 14 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' });

      return resp;
    }

    return NextResponse.json({ detail: 'Unable to fetch users' }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
