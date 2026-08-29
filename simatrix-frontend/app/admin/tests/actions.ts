'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

async function getHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchAdminQuizzes() {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/admin/quizzes/`, {
      headers: await getHeaders(),
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('Failed to fetch quizzes:', res.status);
      return [];
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
}

export async function createQuiz(formData: FormData) {
  try {
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category') || 'exam',
      pass_mark: parseInt(formData.get('pass_mark') as string || '50'),
      course_id: formData.get('course_id') || null, // Optional for now
    };

    const res = await fetch(`${DJANGO_API_URL}/api/quiz/admin/quizzes/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.detail || 'Failed to create test' };
    }

    revalidatePath('/admin/tests');
    return { success: true };
  } catch (error: any) {
    console.error("CREATE QUIZ ERROR:", error);
    return { error: `Server connection failed: ${error.message || 'Unknown error'}` };
  }
}

export async function fetchQuizDetails(slug: string) {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/admin/quizzes/${slug}/`, {
      headers: await getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchQuizQuestions(slug: string) {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/admin/quizzes/${slug}/questions/`, {
      headers: await getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createQuestion(slug: string, payload: any) {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/admin/quizzes/${slug}/questions/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.detail || 'Failed to add question' };
    }

    revalidatePath(`/admin/tests/${slug}`);
    return { success: true };
  } catch {
    return { error: 'Failed to connect to server' };
  }
}

export async function uploadExcelQuestions(slug: string, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    
    // Note: Do not set Content-Type header when sending FormData!
    // fetch will automatically set it to multipart/form-data with the correct boundary
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/admin/quizzes/${slug}/upload-excel/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || 'Failed to parse Excel file.' };
    }

    const data = await res.json();
    revalidatePath(`/admin/tests/${slug}`);
    return { success: true, count: data.imported_count };
  } catch (err) {
    return { error: 'Network error occurred during upload.' };
  }
}
