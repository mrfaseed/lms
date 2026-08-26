import React from 'react';
import CoursesView from './CoursesView';

async function getCourses() {
  const res = await fetch('http://127.0.0.1:8000/api/programs/courses/', { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch courses');
  }
  
  return res.json();
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return <CoursesView courses={courses} />;
}
