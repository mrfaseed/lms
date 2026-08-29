import React from 'react';
import MaterialsDashboard from './MaterialsDashboard';
import { BookOpen } from 'lucide-react';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000';

async function fetchCourse(slug: string) {
  const res = await fetch(`${DJANGO_API_URL}/api/programs/courses/${slug}/`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function LecturerMaterialsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const course = await fetchCourse(resolvedParams.slug);

  if (!course) {
    return <div className="p-12 text-center text-slate-500">Course not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{course.title}</h1>
          <p className="text-slate-500">Manage learning materials and videos for this course.</p>
        </div>
      </div>

      <MaterialsDashboard course={course} slug={resolvedParams.slug} />
    </div>
  );
}
