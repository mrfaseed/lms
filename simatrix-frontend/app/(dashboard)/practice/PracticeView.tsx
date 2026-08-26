'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MOCK_DATA = {
  Python: {
    Easy: [
      { id: 'py-e-1', title: 'Two Sum', topic: 'Arrays', status: 'Completed' },
      { id: 'py-e-2', title: 'Valid Palindrome', topic: 'Strings', status: 'In Progress' },
      { id: 'py-e-3', title: 'Merge Sorted Array', topic: 'Arrays', status: 'Not Started' },
    ],
    Medium: [
      { id: 'py-m-1', title: 'Longest Substring Without Repeating Characters', topic: 'Strings', status: 'Not Started' },
      { id: 'py-m-2', title: '3Sum', topic: 'Arrays', status: 'Not Started' },
    ],
    Hard: [
      { id: 'py-h-1', title: 'Trapping Rain Water', topic: 'Arrays', status: 'Not Started' },
    ]
  },
  JavaScript: {
    Easy: [
      { id: 'js-e-1', title: 'Counter', topic: 'Closures', status: 'Completed' },
      { id: 'js-e-2', title: 'Sleep', topic: 'Promises', status: 'Not Started' },
    ],
    Medium: [],
    Hard: []
  },
  'C++': {
    Easy: [],
    Medium: [],
    Hard: []
  },
  Java: {
    Easy: [],
    Medium: [],
    Hard: []
  }
};

export default function PracticeView() {
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [searchQuery, setSearchQuery] = useState('');

  const languages = Object.keys(MOCK_DATA);
  const difficulties = ['Easy', 'Medium', 'Hard'];

  // @ts-ignore
  const currentProblems = MOCK_DATA[selectedLanguage][selectedDifficulty] || [];
  
  const filteredProblems = currentProblems.filter((p: any) => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Coding Practice</h1>
        <p className="text-slate-600 font-medium mt-2">Master algorithms and data structures. Filter by language and difficulty.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6">
          {/* Language Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Language</h3>
            <div className="space-y-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    selectedLanguage === lang 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Difficulty</h3>
            <div className="space-y-2">
              {difficulties.map(diff => {
                const colors: Record<string, string> = {
                  'Easy': selectedDifficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' : 'text-emerald-600 hover:bg-emerald-50',
                  'Medium': selectedDifficulty === 'Medium' ? 'bg-amber-50 text-amber-700' : 'text-amber-600 hover:bg-amber-50',
                  'Hard': selectedDifficulty === 'Hard' ? 'bg-rose-50 text-rose-700' : 'text-rose-600 hover:bg-rose-50',
                };
                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${colors[diff]}`}
                  >
                    {diff}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedLanguage} - {selectedDifficulty} Problems
              </h2>
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Search problems or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            <div className="p-0">
              {filteredProblems.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <p className="text-lg font-semibold text-slate-900 mb-1">No problems found</p>
                  <p>Try selecting a different language or difficulty.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredProblems.map((problem: any) => (
                    <motion.div 
                      key={problem.id}
                      whileHover={{ backgroundColor: 'rgba(248, 250, 252, 1)' }}
                      className="p-6 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-base font-bold text-slate-900">{problem.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            problem.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            problem.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {problem.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Topic: <span className="text-indigo-600">{problem.topic}</span></p>
                      </div>
                      
                      <Link href={`/workspace?problem=${problem.id}`} className="shrink-0 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 transition-colors shadow-sm flex items-center justify-center">
                        Solve Challenge
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
