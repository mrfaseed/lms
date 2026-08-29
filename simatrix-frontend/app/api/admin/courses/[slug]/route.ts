import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const refresh = cookieStore.get('refresh_token')?.value;

  const backendUrl = `${BACKEND_URL}/api/programs/courses/${slug}/`;

  let bodyData;
  try {
    bodyData = await req.json();
  } catch (e) {
    return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const res = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: 'Bearer ' + access } : {}),
      },
      body: JSON.stringify(bodyData),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    if ((res.status === 401 || res.status === 403) && refresh) {
      const refreshRes = await fetch(new URL('/api/admin/refresh', req.url).toString(), { method: 'POST', cache: 'no-store' });
      if (!refreshRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const refreshData = await refreshRes.json();
      const patchRes = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + refreshData.access,
        },
        body: JSON.stringify(bodyData),
      });

      if (!patchRes.ok) {
        const errorData = await patchRes.json().catch(() => ({ detail: 'Failed to update course' }));
        return NextResponse.json(errorData, { status: patchRes.status });
      }

      const data = await patchRes.json();
      const resp = NextResponse.json(data);

      if (refreshData.access) resp.cookies.set('access_token', refreshData.access, { httpOnly: true, path: '/', maxAge: 15 * 60, secure: process.env.NODE_ENV === 'production' });
      if (refreshData.refresh) resp.cookies.set('refresh_token', refreshData.refresh, { httpOnly: true, path: '/', maxAge: 14 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' });

      return resp;
    }

    const errorData = await res.json().catch(() => ({ detail: 'Unable to update course' }));
    return NextResponse.json(errorData, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const refresh = cookieStore.get('refresh_token')?.value;

  const backendUrl = `${BACKEND_URL}/api/programs/courses/${slug}/`;

  try {
    const res = await fetch(backendUrl, {
      method: 'DELETE',
      headers: access ? { Authorization: 'Bearer ' + access } : {},
    });

    if (res.ok) {
      return NextResponse.json({ detail: 'Deleted successfully' }, { status: 204 });
    }

    if ((res.status === 401 || res.status === 403) && refresh) {
      const refreshRes = await fetch(new URL('/api/admin/refresh', req.url).toString(), { method: 'POST', cache: 'no-store' });
      if (!refreshRes.ok) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

      const refreshData = await refreshRes.json();
      const delRes = await fetch(backendUrl, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + refreshData.access },
      });

      if (!delRes.ok) {
        const errorData = await delRes.json().catch(() => ({ detail: 'Failed to delete course' }));
        return NextResponse.json(errorData, { status: delRes.status });
      }

      const resp = NextResponse.json({ detail: 'Deleted successfully' }, { status: 204 });

      if (refreshData.access) resp.cookies.set('access_token', refreshData.access, { httpOnly: true, path: '/', maxAge: 15 * 60, secure: process.env.NODE_ENV === 'production' });
      if (refreshData.refresh) resp.cookies.set('refresh_token', refreshData.refresh, { httpOnly: true, path: '/', maxAge: 14 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' });

      return resp;
    }

    const errorData = await res.json().catch(() => ({ detail: 'Unable to delete course' }));
    return NextResponse.json(errorData, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
