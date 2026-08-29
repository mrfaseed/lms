import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;

  const backendUrl = `${BACKEND_URL}/api/result/admin-enrollments/`;

  try {
    const res = await fetch(backendUrl, {
      headers: access ? { Authorization: 'Bearer ' + access } : {},
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    
    return NextResponse.json({ detail: 'Unable to fetch enrollments' }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;

  const backendUrl = `${BACKEND_URL}/api/result/admin-enrollments/`;
  
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

    const errorData = await res.json().catch(() => ({ detail: 'Unable to create enrollment' }));
    return NextResponse.json(errorData, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
