'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  let redirectPath = '/';

  try {
    const res = await fetch('http://127.0.0.1:8000/accounts/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      cache: 'no-store'
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.detail || 'Invalid credentials' };
    }

    // Use await for cookies in Next.js 15+ compatible way
    const cookieStore = await cookies();
    
    // Store tokens in HTTP-only cookies
    cookieStore.set('access_token', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    cookieStore.set('refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 60 * 60, // 14 days
      path: '/',
    });

    // Check user role
    const meUrl = 'http://127.0.0.1:8000/accounts/api/me/';
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

  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
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

