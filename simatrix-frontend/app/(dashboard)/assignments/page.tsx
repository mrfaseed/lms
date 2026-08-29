import React from 'react';
import Link from 'next/link';
import { BookOpen, Lock } from 'lucide-react';

export const metadata = {
  title: 'My Assignments - Simatrix Academy',
  description: 'View all your pending and completed coding assignments and quizzes.',
};

import { cookies } from 'next/headers';

async function getQuizzes() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const res = await fetch('http://127.0.0.1:8000/api/programs/courses/', { 
    cache: 'no-store',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    return [];
  }
  const courses = await res.json();
  let quizzes: any[] = [];
  
  for (const course of courses) {
    if (course.quizzes && course.quizzes.length > 0) {
      for (const quiz of course.quizzes) {
        let status = 'Available';
        let isTerminated = false;
        let terminationReason = '';

        if (quiz.user_sitting) {
          if (quiz.user_sitting.terminated) {
            status = 'Terminated';
            isTerminated = true;
            terminationReason = quiz.user_sitting.violation_reason;
          } else if (quiz.user_sitting.complete) {
            status = 'Completed';
          } else {
            status = 'In Progress';
          }
        }

        quizzes.push({
          id: quiz.id,
          title: quiz.title,
          course: course.title,
          course_slug: course.slug,
          quiz_slug: quiz.slug,
          type: 'Quiz',
          difficulty: 'Variable',
          status: status,
          isTerminated: isTerminated,
          terminationReason: terminationReason,
          dueDate: 'Anytime',
          url: `/test/${quiz.slug}`
        });
      }
    }
  }
  return quizzes;
}

export default async function AssignmentsPage() {
  const assignments = await getQuizzes();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Assignments</h1>
        <p className="text-slate-600 font-medium mt-2">Manage your coding challenges and quizzes across all enrolled courses.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-0">
          <ul className="divide-y divide-slate-100">
            {assignments.length === 0 ? (
              <li className="p-12 text-center text-slate-500">
                No assignments or quizzes available at the moment.
              </li>
            ) : assignments.map((assignment) => (
              <li key={assignment.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className={`flex items-start ${assignment.isTerminated ? 'opacity-75 grayscale-[10%]' : ''}`}>
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 ${
                    assignment.isTerminated ? 'bg-slate-100 text-slate-400' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {assignment.isTerminated ? <Lock className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded">{assignment.course}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-100 text-indigo-700">
                        {assignment.type}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                        assignment.isTerminated ? 'bg-rose-100 text-rose-700' : 
                        assignment.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {assignment.isTerminated ? 'No longer available due to secure exam policy.' : `Due: ${assignment.dueDate}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 mt-4 md:mt-0">
                  {assignment.isTerminated ? (
                    <button disabled className="inline-flex items-center px-6 py-2.5 rounded-lg font-bold text-sm bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed">
                      <Lock className="w-4 h-4 mr-2" />
                      Quiz Locked
                    </button>
                  ) : (
                    <Link href={assignment.url} className="inline-flex items-center px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm bg-indigo-600 text-white hover:bg-indigo-700">
                      {assignment.status === 'Completed' ? 'Review Quiz' : 'Take Quiz'}
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
