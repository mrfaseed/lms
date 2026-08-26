'use server';

import { cookies } from 'next/headers';

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return { error: 'Not authenticated' };
  }

  try {
    const res = await fetch('http://127.0.0.1:8000/accounts/api/me/', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      cache: 'no-store'
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || 'Failed to update profile' };
    }

    return await res.json();
  } catch (e) {
    return { error: 'Network error updating profile' };
  }
}
