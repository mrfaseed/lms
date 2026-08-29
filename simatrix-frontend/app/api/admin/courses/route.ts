import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const refresh = cookieStore.get('refresh_token')?.value;

  const backendUrl = `${BACKEND_URL}/api/programs/courses/`;

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
      const coursesRes = await fetch(backendUrl, {
        headers: { Authorization: 'Bearer ' + refreshData.access },
        cache: 'no-store',
      });

      if (!coursesRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const data = await coursesRes.json();
      const resp = NextResponse.json(data);

      // Update cookies on client
      if (refreshData.access) resp.cookies.set('access_token', refreshData.access, { httpOnly: true, path: '/', maxAge: 15 * 60, secure: process.env.NODE_ENV === 'production' });
      if (refreshData.refresh) resp.cookies.set('refresh_token', refreshData.refresh, { httpOnly: true, path: '/', maxAge: 14 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' });

      return resp;
    }

    return NextResponse.json({ detail: 'Unable to fetch courses' }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const refresh = cookieStore.get('refresh_token')?.value;

  const backendUrl = `${BACKEND_URL}/api/programs/courses/`;
  
  let bodyData;
  try {
    bodyData = await req.json();
  } catch (e) {
    return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: 'Bearer ' + access } : {}),
      },
      body: JSON.stringify(bodyData),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }

    if ((res.status === 401 || res.status === 403) && refresh) {
      const refreshRes = await fetch(new URL('/api/admin/refresh', req.url).toString(), { method: 'POST', cache: 'no-store' });
      if (!refreshRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const refreshData = await refreshRes.json();
      const createRes = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + refreshData.access,
        },
        body: JSON.stringify(bodyData),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => ({ detail: 'Failed to create course' }));
        return NextResponse.json(errorData, { status: createRes.status });
      }

      const data = await createRes.json();
      const resp = NextResponse.json(data, { status: 201 });

      if (refreshData.access) resp.cookies.set('access_token', refreshData.access, { httpOnly: true, path: '/', maxAge: 15 * 60, secure: process.env.NODE_ENV === 'production' });
      if (refreshData.refresh) resp.cookies.set('refresh_token', refreshData.refresh, { httpOnly: true, path: '/', maxAge: 14 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' });

      return resp;
    }

    const errorData = await res.json().catch(() => ({ detail: 'Unable to create course' }));
    return NextResponse.json(errorData, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
