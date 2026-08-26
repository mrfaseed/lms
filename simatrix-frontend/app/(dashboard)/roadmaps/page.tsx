import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Learning Roadmaps - Simatrix Academy',
  description: 'Visual learning roadmaps to guide your career path.',
};

export default function RoadmapsPage() {
  const roadmaps = [
    {
      id: 'full-stack',
      title: 'Full Stack Web Developer',
      description: 'Master frontend and backend development from scratch. Learn React, Node.js, databases, and deployment.',
      progress: 45,
      totalSteps: 12,
      completedSteps: 5,
      color: 'indigo'
    },
    {
      id: 'data-science',
      title: 'Data Science & Machine Learning',
      description: 'Learn Python, data analysis with Pandas, machine learning algorithms, and deep learning with TensorFlow.',
      progress: 0,
      totalSteps: 10,
      completedSteps: 0,
      color: 'emerald'
    },
    {
      id: 'mobile-dev',
      title: 'iOS & Android App Developer',
      description: 'Build native and cross-platform mobile apps using Flutter, React Native, Swift, and Kotlin.',
      progress: 10,
      totalSteps: 8,
      completedSteps: 1,
      color: 'blue'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Learning Roadmaps</h1>
        <p className="text-slate-600 font-medium mt-2">Follow structured paths to achieve your career goals. Step-by-step guides for mastering technologies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roadmaps.map((roadmap) => {
          const colorClasses: Record<string, string> = {
            'indigo': 'bg-indigo-600 text-white',
            'emerald': 'bg-emerald-600 text-white',
            'blue': 'bg-blue-600 text-white'
          };
          const lightColorClasses: Record<string, string> = {
            'indigo': 'bg-indigo-50 text-indigo-700',
            'emerald': 'bg-emerald-50 text-emerald-700',
            'blue': 'bg-blue-50 text-blue-700'
          };

          return (
            <div key={roadmap.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-6 flex-grow flex flex-col">
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${lightColorClasses[roadmap.color]}`}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{roadmap.title}</h3>
                <p className="text-slate-500 text-sm mb-6 flex-grow">{roadmap.description}</p>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                    <span className="text-sm font-bold text-slate-700">{roadmap.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                    <div className={`h-2 rounded-full ${colorClasses[roadmap.color].split(' ')[0]}`} style={{ width: `${roadmap.progress}%` }}></div>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mb-6">{roadmap.completedSteps} of {roadmap.totalSteps} steps completed</p>
                  
                  <button className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${
                    roadmap.progress > 0 
                      ? colorClasses[roadmap.color] + ' hover:opacity-90' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                    {roadmap.progress > 0 ? 'Continue Roadmap' : 'Start Roadmap'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
