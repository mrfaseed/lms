import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const refresh = cookieStore.get('refresh_token')?.value;

  const body = await req.json();
  const backendUrl = `${BACKEND_URL}/accounts/api/admin/users/${id}/`;

  try {
    const res = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: 'Bearer ' + access } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    if ((res.status === 401 || res.status === 403) && refresh) {
      const refreshRes = await fetch(new URL('/api/admin/refresh', req.url).toString(), { method: 'POST', cache: 'no-store' });
      if (!refreshRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
      const refreshData = await refreshRes.json();

      const retryRes = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + refreshData.access,
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });

      if (!retryRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const data = await retryRes.json();
      const resp = NextResponse.json(data);
      if (refreshData.access) resp.cookies.set('access_token', refreshData.access, { httpOnly: true, path: '/', maxAge: 15 * 60, secure: process.env.NODE_ENV === 'production' });
      if (refreshData.refresh) resp.cookies.set('refresh_token', refreshData.refresh, { httpOnly: true, path: '/', maxAge: 14 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' });
      return resp;
    }

    return NextResponse.json({ detail: 'Unable to update user' }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const refresh = cookieStore.get('refresh_token')?.value;
  const backendUrl = `${BACKEND_URL}/accounts/api/admin/users/${id}/`;

  try {
    const res = await fetch(backendUrl, {
      method: 'DELETE',
      headers: access ? { Authorization: 'Bearer ' + access } : {},
      cache: 'no-store',
    });

    if (res.ok) {
      return NextResponse.json({ detail: 'Deleted' });
    }

    if ((res.status === 401 || res.status === 403) && refresh) {
      const refreshRes = await fetch(new URL('/api/admin/refresh', req.url).toString(), { method: 'POST', cache: 'no-store' });
      if (!refreshRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
      const refreshData = await refreshRes.json();

      const retryRes = await fetch(backendUrl, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + refreshData.access },
        cache: 'no-store',
      });

      if (!retryRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const resp = NextResponse.json({ detail: 'Deleted' });
      if (refreshData.access) resp.cookies.set('access_token', refreshData.access, { httpOnly: true, path: '/', maxAge: 15 * 60, secure: process.env.NODE_ENV === 'production' });
      if (refreshData.refresh) resp.cookies.set('refresh_token', refreshData.refresh, { httpOnly: true, path: '/', maxAge: 14 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' });
      return resp;
    }

    return NextResponse.json({ detail: 'Unable to delete user' }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
