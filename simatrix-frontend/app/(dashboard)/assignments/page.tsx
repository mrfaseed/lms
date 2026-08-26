import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'My Assignments - Simatrix Academy',
  description: 'View all your pending and completed coding assignments and quizzes.',
};

export default function AssignmentsPage() {
  const assignments = [
    {
      id: 'reverse-string',
      title: 'Reverse String',
      course: 'Python Bootcamp',
      type: 'Coding',
      difficulty: 'Easy',
      status: 'Completed',
      dueDate: 'Oct 15, 2026',
      url: '/workspace?assignment=reverse-string',
    },
    {
      id: 'two-sum',
      title: 'Two Sum',
      course: 'Python Bootcamp',
      type: 'Coding',
      difficulty: 'Medium',
      status: 'In Progress',
      dueDate: 'Oct 20, 2026',
      url: '/workspace?assignment=two-sum',
    },
    {
      id: 'react-components-quiz',
      title: 'React Components Quiz',
      course: 'Full Stack React',
      type: 'Quiz',
      difficulty: 'Medium',
      status: 'Not Started',
      dueDate: 'Oct 22, 2026',
      url: '/courses/full-stack-react/quiz/react-components',
    },
    {
      id: 'lru-cache',
      title: 'LRU Cache',
      course: 'Data Structures',
      type: 'Coding',
      difficulty: 'Hard',
      status: 'Not Started',
      dueDate: 'Nov 01, 2026',
      url: '/workspace?assignment=lru-cache',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Assignments</h1>
        <p className="text-slate-600 font-medium mt-2">Manage your coding challenges and quizzes across all enrolled courses.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-0">
          <ul className="divide-y divide-slate-100">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex items-start">
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 ${
                    assignment.type === 'Coding' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {assignment.type === 'Coding' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded">{assignment.course}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                        assignment.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                        assignment.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {assignment.difficulty}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                        assignment.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Due: {assignment.dueDate}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 mt-4 md:mt-0">
                  <Link href={assignment.url} className={`inline-flex items-center px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm ${
                    assignment.status === 'Completed' 
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}>
                    {assignment.type === 'Coding' ? (
                      assignment.status === 'Completed' ? 'Review Code' : 'Open IDE'
                    ) : (
                      assignment.status === 'Completed' ? 'Review Quiz' : 'Take Quiz'
                    )}
                    <svg className={`w-4 h-4 ml-2 ${assignment.status !== 'Completed' ? 'group-hover:translate-x-1 transition-transform' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
