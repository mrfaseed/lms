'use server';

import { cookies } from 'next/headers';

export async function getStudentDashboardStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return { error: 'Not authenticated' };
  }

  try {
    const res = await fetch('http://127.0.0.1:8000/api/core/student-dashboard/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || 'Failed to fetch dashboard stats' };
    }

    return await res.json();
  } catch (e) {
    return { error: 'Network error fetching dashboard stats' };
  }
}
