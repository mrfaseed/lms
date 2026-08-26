'use server';

import { cookies } from 'next/headers';

export async function submitQuizAnswer(quizSlug: string, answerId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return { error: 'Not authenticated' };
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/quiz/${quizSlug}/submit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ answer_id: answerId }),
      cache: 'no-store'
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || 'Failed to submit answer' };
    }

    return await res.json();
  } catch (e) {
    return { error: 'Network error submitting answer' };
  }
}

export async function getQuizState(quizSlug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return { error: 'Not authenticated' };
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/quiz/${quizSlug}/take/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || 'Failed to fetch quiz state' };
    }

    return await res.json();
  } catch (e) {
    return { error: 'Network error fetching quiz' };
  }
}
