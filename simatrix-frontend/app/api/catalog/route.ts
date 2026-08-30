import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get('access_token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (access) {
      headers['Authorization'] = `Bearer ${access}`;
    }

    const res = await fetch(`${BACKEND_URL}/api/course/catalog/`, {
      method: 'GET',
      headers,
      cache: 'no-store' // Ensure we get fresh catalog data
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: 'Server connection failed' }, { status: 500 });
  }
}
