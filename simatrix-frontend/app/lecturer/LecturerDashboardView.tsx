'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LecturerDashboardView({ courses }: { courses: any[] }) {
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
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">My Courses</h1>
        <p className="text-slate-600 font-medium">Manage your allocated courses and assignments.</p>
      </motion.div>

      {courses.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <p className="text-slate-500 font-medium text-lg">No courses allocated to you currently.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div 
              key={course.id} 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-default transition-all"
            >
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col justify-end relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-white relative z-10 truncate" title={course.title}>
                  {course.title}
                </h3>
                <p className="text-indigo-100 font-medium text-sm relative z-10">{course.code}</p>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">{course.level}</span>
                  <span className="text-sm font-bold text-indigo-600">{course.credit} Credits</span>
                </div>
                
                {course.summary && (
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                    {course.summary}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href={`/lecturer/courses/${course.slug}/materials`} 
                    className="text-center py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20"
                  >
                    Materials
                  </Link>
                  <Link 
                    href={`/lecturer/gradebook?course=${course.id}`} 
                    className="text-center py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Gradebook
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
