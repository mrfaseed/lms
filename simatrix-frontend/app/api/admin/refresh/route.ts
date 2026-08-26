import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(req: Request) {
  const cookieStore = cookies();
  const refresh = cookieStore.get('refresh_token')?.value;

  if (!refresh) {
    return NextResponse.json({ detail: 'No refresh token' }, { status: 401 });
  }

  try {
    const refreshRes = await fetch(`${BACKEND_URL}/accounts/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
      cache: 'no-store',
    });

    if (!refreshRes.ok) {
      return NextResponse.json({ detail: 'Refresh failed' }, { status: 401 });
    }

    const refreshData = await refreshRes.json();
    // Return tokens so middleware or other server routes can set cookies
    return NextResponse.json(refreshData);
  } catch (err) {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
