'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CoursesView({ courses }: { courses: any[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Course Catalog</h1>
        <p className="text-slate-600 font-medium">Browse all available courses in the LMS.</p>
      </motion.div>

      {courses.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500 font-medium">
          No courses currently available.
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <motion.div 
              key={course.id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block group h-full"
            >
              <Link href={`/courses/${course.slug}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-xl transition-all overflow-hidden h-full flex flex-col cursor-pointer group">
                  <div className="h-36 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 relative p-6 flex items-end">
                    <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md backdrop-blur-md shadow-sm">
                      {course.code}
                    </div>
                    <h2 className="text-xl font-black text-white leading-tight group-hover:underline decoration-white/50">{course.title}</h2>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-3 leading-relaxed">
                      {course.summary || 'No description provided for this course.'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100">
                      <span className="flex items-center text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        {course.credit} Credits
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
                        Year {course.year}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
