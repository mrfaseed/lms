'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SearchView({ query, initialResults }: { query: string, initialResults: any }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Search Simatrix</h1>
        <p className="text-slate-500">Enter a search term above to find courses, quizzes, and news.</p>
      </div>
    );
  }

  const hasResults = initialResults && (initialResults.courses.length > 0 || initialResults.quizzes.length > 0 || initialResults.news.length > 0);

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Search Results</h1>
        <p className="text-slate-600 font-medium">Showing results for: <span className="text-indigo-600 font-bold">"{query}"</span></p>
      </motion.div>

      {!hasResults ? (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No results found</h3>
          <p className="text-slate-500">We couldn't find anything matching your search. Try adjusting your keywords.</p>
        </motion.div>
      ) : (
        <div className="space-y-12">
          
          {/* Courses */}
          {initialResults.courses.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Courses ({initialResults.courses.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialResults.courses.map((course: any) => (
                  <Link key={course.id} href={`/courses/${course.slug}`}>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer h-full flex flex-col group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md uppercase">{course.code}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{course.summary || 'No description'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quizzes */}
          {initialResults.quizzes.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Quizzes ({initialResults.quizzes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {initialResults.quizzes.map((quiz: any) => (
                  <div key={quiz.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-slate-900">{quiz.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{quiz.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* News */}
          {initialResults.news.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                News & Events ({initialResults.news.length})
              </h2>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {initialResults.news.map((item: any) => (
                    <div key={item.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{item.type}</span>
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-2">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      )}
    </motion.div>
  );
}
