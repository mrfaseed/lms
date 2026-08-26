import React from 'react';
import Link from 'next/link';
import CourseTabs from './CourseTabs';

async function getCourse(slug: string) {
  const res = await fetch(`http://127.0.0.1:8000/api/programs/courses/${slug}/`, { cache: 'no-store' });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch course details');
  }
  
  return res.json();
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const course = await getCourse(resolvedParams.slug);

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
        <p className="text-gray-600 mb-8">The course you are looking for does not exist.</p>
        <Link href="/courses" className="text-blue-600 hover:underline">
          &larr; Back to Course Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/courses" className="text-sm text-gray-500 hover:text-blue-600 mb-6 inline-block transition-colors">
        &larr; Back to Catalog
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Banner */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative p-8 flex flex-col justify-end">
          <div className="absolute top-6 right-6 bg-white/20 text-white font-bold px-3 py-1 rounded-md backdrop-blur-sm border border-white/30">
            {course.code}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {course.title}
          </h1>
        </div>
        
        {/* Interactive Tabs */}
        <CourseTabs course={course} />
      </div>
    </div>
  );
}
