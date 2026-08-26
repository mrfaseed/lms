import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET() {
  const cookieStore = cookies();
  const access = cookieStore.get('access_token')?.value;
  const refresh = cookieStore.get('refresh_token')?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/accounts/api/admin/stats/`, {
      headers: access ? { Authorization: 'Bearer ' + access } : {},
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Try refresh if unauthorized and refresh token available
    if ((res.status === 401 || res.status === 403) && refresh) {
      const refreshRes = await fetch(`${BACKEND_URL}/accounts/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
        cache: 'no-store',
      });

      if (!refreshRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const refreshData = await refreshRes.json();
      const statsRes = await fetch(`${BACKEND_URL}/accounts/api/admin/stats/`, {
        headers: { Authorization: 'Bearer ' + refreshData.access },
        cache: 'no-store',
      });

      if (!statsRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const data = await statsRes.json();
      const resp = NextResponse.json(data);

      // Update cookies
      if (refreshData.access) resp.cookies.set('access_token', refreshData.access, { httpOnly: true, path: '/', maxAge: 15 * 60, secure: process.env.NODE_ENV === 'production' });
      if (refreshData.refresh) resp.cookies.set('refresh_token', refreshData.refresh, { httpOnly: true, path: '/', maxAge: 14 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' });

      return resp;
    }

    return NextResponse.json({ detail: 'Unable to fetch stats' }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
