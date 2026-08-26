import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import GradebookView from './GradebookView';

async function getLecturerGrades() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payloadBase64 = token.split('.')[1];
  const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
  const payload = JSON.parse(payloadStr);
  const userId = payload.user_id;

  const res = await fetch(`http://127.0.0.1:8000/api/result/lecturer/${userId}/grades/`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

async function getLecturerCourses() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return [];
  const payloadBase64 = token.split('.')[1];
  const userId = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8')).user_id;
  
  const res = await fetch(`http://127.0.0.1:8000/api/course/lecturer/${userId}/courses/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function GradebookPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const params = await searchParams;
  const initialCourse = params.course;
  const grades = await getLecturerGrades();
  const courses = await getLecturerCourses();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value || '';
  const payloadBase64 = token.split('.')[1];
  const userId = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8')).user_id;

  return <GradebookView initialGrades={grades} courses={courses} token={token} lecturerId={userId} initialCourseId={initialCourse} />;
}
