import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AnalyticsView from './AnalyticsView';

async function getAnalyticsData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  // We need the student_id to fetch analytics.
  // We can decode the token or fetch the profile endpoint first.
  const profileRes = await fetch('http://127.0.0.1:8000/api/core/student-dashboard/', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!profileRes.ok) {
    throw new Error('Failed to fetch student profile');
  }

  const profile = await profileRes.json();
  const studentId = profile.student_id;

  const analyticsRes = await fetch(`http://127.0.0.1:8000/api/result/analytics/${studentId}/`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!analyticsRes.ok) {
    throw new Error('Failed to fetch student analytics');
  }

  return analyticsRes.json();
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsView data={data} />;
}
