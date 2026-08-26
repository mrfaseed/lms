'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardView({ stats }: { stats: any }) {
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
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
          Welcome back, <span className="text-indigo-600">{stats.student_name}</span>!
        </h1>
        <p className="text-slate-600 font-medium">Here's what's happening in your {stats.program} program.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Priority Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Resume Coding (Top Priority) */}
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-md overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div className="p-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="text-white mb-6 md:mb-0">
                <p className="text-indigo-100 font-semibold mb-1 uppercase tracking-widest text-xs">Resume Coding</p>
                <h2 className="text-3xl font-black mb-2">{stats.resume_coding.title}</h2>
                <p className="text-indigo-100 font-medium mb-4">{stats.resume_coding.last_lesson}</p>
                <div className="flex items-center w-full md:w-64">
                  <div className="w-full bg-indigo-900/40 rounded-full h-2 mr-3">
                    <div className="bg-white h-2 rounded-full" style={{ width: `${stats.resume_coding.progress}%` }}></div>
                  </div>
                  <span className="text-sm font-bold">{stats.resume_coding.progress}%</span>
                </div>
              </div>
              <Link href={stats.resume_coding.url} className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-colors flex items-center group">
                Continue
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              </div>
              <div className="p-6 bg-white flex-1">
                <ul className="space-y-5">
                  {stats.recent_activity.map((activity: any, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 mt-0.5 shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-sm font-medium text-slate-700">{activity.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Upcoming Quiz */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Upcoming Quiz</h2>
              </div>
              <div className="p-6 bg-white flex-1 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{stats.upcoming_quiz.title}</h3>
                <p className="text-sm font-semibold text-amber-600 mb-4">{stats.upcoming_quiz.date}</p>
                <Link href={stats.upcoming_quiz.url} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors">
                  Prepare Now
                </Link>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Right Column: Coding Stats & News */}
        <div className="space-y-8">
          
          {/* Coding Stats Widget */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Coding Stats</h2>
            </div>
            <div className="p-6 bg-white grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Problems Solved</p>
                <p className="text-3xl font-black text-indigo-600">{stats.developer_stats.problemsSolved}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hours This Week</p>
                <p className="text-3xl font-black text-emerald-600">{stats.developer_stats.codingHours}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-fit">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">News & Announcements</h2>
            </div>
            <div className="p-0 bg-white">
              {stats.news.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-medium">No announcements.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.news.map((item: any, idx: number) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ x: 4, backgroundColor: 'rgba(248, 250, 252, 1)' }}
                      className="p-6 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm ${
                          item.type === 'Event' ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-sky-100 text-sky-700'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">{item.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2 leading-tight">{item.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{item.summary}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
