'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AnalyticsView({ data }: { data: any }) {
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

  // Pie chart data
  const quizData = [
    { name: 'Passed', value: data.quiz_stats.passed },
    { name: 'Failed', value: data.quiz_stats.failed }
  ];
  const COLORS = ['#10b981', '#f43f5e']; // Emerald and Rose

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Performance Analytics</h1>
        <p className="text-slate-600 font-medium">Track your academic progress and quiz statistics.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GPA Over Time Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Average Score Progression</h2>
          </div>
          <div className="p-6 flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.score_history} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="semester" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[0, 100]} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Column: Developer Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Problems Solved</p>
            <p className="text-2xl font-black text-slate-900">{data.developer_stats.problemsSolved}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Coding Hours</p>
            <p className="text-2xl font-black text-slate-900">{data.developer_stats.codingHours}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Languages</p>
            <p className="text-2xl font-black text-slate-900">{data.developer_stats.languagesLearned}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Streak</p>
            <p className="text-2xl font-black text-slate-900">{data.developer_stats.currentStreak} <span className="text-sm font-medium text-slate-500">days</span></p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Score</p>
            <p className="text-2xl font-black text-slate-900">{data.developer_stats.averageQuizScore}%</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completion</p>
            <p className="text-2xl font-black text-slate-900">{data.developer_stats.completionRate}%</p>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
