'use server';

import { cookies } from 'next/headers';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

async function getHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchNextQuestion(slug: string) {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/${slug}/take/`, {
      headers: await getHeaders(),
      cache: 'no-store'
    });
    
    if (!res.ok) {
      const err = await res.json();
      if (err.terminated) {
        return { terminated: true, violation_reason: err.violation_reason };
      }
      return { error: err.error || 'Failed to fetch question' };
    }
    
    return await res.json();
  } catch (error) {
    return { error: 'Network connection failed' };
  }
}

export async function submitAnswer(slug: string, answerId: number) {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/${slug}/submit/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ answer_id: answerId })
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || 'Failed to submit answer' };
    }

    return await res.json();
  } catch (error) {
    return { error: 'Network connection failed' };
  }
}

export async function terminateTest(slug: string, reason: string) {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/quiz/${slug}/violate/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ reason })
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || 'Failed to terminate test' };
    }

    return await res.json();
  } catch (error) {
    return { error: 'Network connection failed' };
  }
}
