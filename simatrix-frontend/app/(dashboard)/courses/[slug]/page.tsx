import React from 'react';
import { BookOpen, FileDown, PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000';

async function fetchCourse(slug: string) {
  const res = await fetch(`${DJANGO_API_URL}/api/programs/courses/${slug}/`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const course = await fetchCourse(resolvedParams.slug);

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-700">Course Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-indigo-600 rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <BookOpen className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <span className="bg-indigo-500/50 text-indigo-100 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block">
            {course.code}
          </span>
          <h1 className="text-4xl font-black mb-4 tracking-tight">{course.title}</h1>
          <p className="text-indigo-100 text-lg max-w-2xl">{course.summary || 'Explore the learning materials, videos, and quizzes for this course.'}</p>
        </div>
      </div>

      {/* Course Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area: Videos and Documents */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Videos Section */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <PlayCircle className="w-5 h-5" />
              </div>
              Video Lectures
            </h2>
            
            {!course.videos || course.videos.length === 0 ? (
              <p className="text-slate-500">No video lectures available for this course.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.videos.map((vid: any) => (
                  <div key={vid.id} className="group border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                    {/* Fake Video Thumbnail Area */}
                    <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white/50 group-hover:text-white group-hover:scale-110 transition-all" />
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <h3 className="font-bold text-slate-900 line-clamp-1">{vid.title}</h3>
                      {vid.summary && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{vid.summary}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Documents Section */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileDown className="w-5 h-5" />
              </div>
              Course Documents
            </h2>

            {!course.uploads || course.uploads.length === 0 ? (
              <p className="text-slate-500">No documents available for this course.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {course.uploads.map((doc: any) => (
                  <li key={doc.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{doc.title}</h3>
                        <p className="text-xs text-slate-400 uppercase font-medium">Document</p>
                      </div>
                    </div>
                    <a href={`${DJANGO_API_URL}${doc.file}`} download target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 text-sm font-bold rounded-lg transition-colors">
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>

        {/* Sidebar: Quizzes & Assignments */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              Assessments
            </h3>
            
            {!course.quizzes || course.quizzes.length === 0 ? (
              <p className="text-slate-400">No quizzes available.</p>
            ) : (
              <ul className="space-y-3">
                {course.quizzes.map((quiz: any) => (
                  <li key={quiz.id}>
                    <Link href={`/test/${quiz.slug}`} className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                      <h4 className="font-bold text-slate-100">{quiz.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">Quiz</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
