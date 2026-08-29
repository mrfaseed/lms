import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000';

async function performAuthenticatedFetch(url: string, options: RequestInit, reqUrl: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  const refresh = cookieStore.get('refresh_token')?.value;

  let res = await fetch(url, {
    ...options,
    headers: { ...options.headers, 'Authorization': `Bearer ${token}` }
  });

  let refreshData = null;

  if ((res.status === 401 || res.status === 403) && refresh) {
    const refreshRes = await fetch(new URL('/api/admin/refresh', reqUrl).toString(), { method: 'POST', cache: 'no-store' });
    if (refreshRes.ok) {
      refreshData = await refreshRes.json();
      res = await fetch(url, {
        ...options,
        headers: { ...options.headers, 'Authorization': `Bearer ${refreshData.access}` }
      });
    }
  }

  return { res, refreshData };
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { res, refreshData } = await performAuthenticatedFetch(`${DJANGO_API_URL}/api/programs/allocations/${id}/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }, req.url);

    let response;
    if (res.status === 204) {
      response = new NextResponse(null, { status: 204 });
    } else {
      const data = await res.json();
      response = NextResponse.json(data, { status: res.status });
    }
    
    if (refreshData?.access) response.cookies.set('access_token', refreshData.access, { httpOnly: true, path: '/', maxAge: 15 * 60, secure: process.env.NODE_ENV === 'production' });
    if (refreshData?.refresh) response.cookies.set('refresh_token', refreshData.refresh, { httpOnly: true, path: '/', maxAge: 14 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' });
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete allocation' }, { status: 500 });
  }
}
