import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;

  const backendUrl = `${BACKEND_URL}/api/result/admin-enrollments/${id}/`;

  try {
    const res = await fetch(backendUrl, {
      method: 'DELETE',
      headers: access ? { Authorization: 'Bearer ' + access } : {},
    });

    if (res.ok) {
      return new NextResponse(null, { status: 204 });
    }

    const errorData = await res.json().catch(() => ({ detail: 'Unable to delete enrollment' }));
    return NextResponse.json(errorData, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
