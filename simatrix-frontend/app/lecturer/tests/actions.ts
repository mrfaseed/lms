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

export async function fetchLecturerQuizzes() {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/lecturer/quizzes/`, {
      headers: await getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
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
      course_id: formData.get('course_id') || null,
    };

    const res = await fetch(`${DJANGO_API_URL}/api/quiz/lecturer/quizzes/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.detail || 'Failed to create test. Ensure you are assigned to this course.' };
    }

    revalidatePath('/lecturer/tests');
    return { success: true };
  } catch (error) {
    return { error: 'Server connection failed' };
  }
}

export async function fetchQuizDetails(slug: string) {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/lecturer/quizzes/${slug}/`, {
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
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/lecturer/quizzes/${slug}/questions/`, {
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
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/lecturer/quizzes/${slug}/questions/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.detail || 'Failed to add question' };
    }

    revalidatePath(`/lecturer/tests/${slug}`);
    return { success: true };
  } catch {
    return { error: 'Failed to connect to server' };
  }
}

export async function uploadExcelQuestions(slug: string, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/lecturer/quizzes/${slug}/upload-excel/`, {
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
    revalidatePath(`/lecturer/tests/${slug}`);
    return { success: true, count: data.imported_count };
  } catch (err) {
    return { error: 'Network error occurred during upload.' };
  }
}
