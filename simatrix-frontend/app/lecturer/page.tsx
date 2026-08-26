import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LecturerDashboardView from './LecturerDashboardView';

async function getLecturerCourses() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  // To fetch courses, we need the lecturer's user ID.
  // We can decode the JWT token payload. 
  // For simplicity since we don't have jsonwebtoken installed in server components without issues,
  // we can use a small JS snippet to parse the base64 payload.
  const payloadBase64 = token.split('.')[1];
  const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
  const payload = JSON.parse(payloadStr);
  const userId = payload.user_id;

  const res = await fetch(`http://127.0.0.1:8000/api/course/lecturer/${userId}/courses/`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    // If it fails, return empty list
    return [];
  }

  return res.json();
}

export default async function LecturerPage() {
  const courses = await getLecturerCourses();
  
  return <LecturerDashboardView courses={courses} />;
}
