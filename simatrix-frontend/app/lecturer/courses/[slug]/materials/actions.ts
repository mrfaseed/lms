'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000';

export async function uploadFile(slug: string, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${DJANGO_API_URL}/api/programs/lecturer/${slug}/upload/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData, // fetch natively supports FormData!
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload file');
  }

  revalidatePath(`/lecturer/courses/${slug}/materials`);
  return res.json();
}

export async function uploadVideo(slug: string, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${DJANGO_API_URL}/api/programs/lecturer/${slug}/upload-video/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload video');
  }

  revalidatePath(`/lecturer/courses/${slug}/materials`);
  return res.json();
}

export async function deleteUpload(slug: string, id: number, type: 'file' | 'video') {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) throw new Error('Unauthorized');

  const endpoint = type === 'file' 
    ? `/api/programs/lecturer/${slug}/upload/${id}/`
    : `/api/programs/lecturer/${slug}/upload-video/${id}/`;

  const res = await fetch(`${DJANGO_API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete');
  }

  revalidatePath(`/lecturer/courses/${slug}/materials`);
  return { success: true };
}
