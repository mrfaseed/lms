'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
  const username = (formData.get('username') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();

  console.log(`[LOGIN ATTEMPT] username: "${username}", password length: ${password?.length}`);

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  let redirectPath = '/';

  try {
    const res = await fetch(`http://127.0.0.1:8000/accounts/api/token/?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({ username, password }),
      cache: 'no-store'
    });

    const data = await res.json();
    console.log(`[LOGIN RESPONSE] status: ${res.status}, ok: ${res.ok}, data:`, data);

    if (!res.ok) {
      return { error: data.detail || 'Invalid credentials' };
    }

    const cookieStore = await cookies();
    
    cookieStore.set('access_token', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    
    cookieStore.set('refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 60 * 60,
      path: '/',
    });

    const meUrl = `http://127.0.0.1:8000/accounts/api/me/?t=${Date.now()}`;
    const meRes = await fetch(meUrl, {
      headers: {
        'Authorization': 'Bearer ' + data.access,
      },
      cache: 'no-store'
    });
    
    if (meRes.ok) {
      const userData = await meRes.json();
      
      if (userData.is_superuser) {
        redirectPath = '/admin';
      } else if (userData.is_lecturer) {
        redirectPath = '/lecturer';
      } else if (userData.is_student) {
        redirectPath = '/';
      } else {
        cookieStore.delete('access_token');
        cookieStore.delete('refresh_token');
        return { error: 'Access denied. Unknown role.' };
      }

    } else {
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      return { error: 'Failed to verify user profile.' };
    }

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return { error: `Server connection failed: ${error.message || 'Unknown error'}` };
  }

  // Redirect to respective dashboard on success
  redirect(redirectPath);
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  redirect('/login');
}

