'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchLecturerQuizzes } from './actions';
import { FileText, Plus, ArrowRight, Activity, Users, LayoutGrid, ShieldCheck, Layers, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LecturerTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLecturerQuizzes().then(data => {
      setTests(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-20">
      {/* Ambient Global Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-400/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] rounded-full bg-teal-400/5 blur-[120px]" />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200/60"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Lecturer Portal
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Layers className="w-8 h-8 text-emerald-600" />
              My Course Tests
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Manage strict-mode quizzes and examinations for the courses you teach.</p>
          </div>
          <Link 
            href="/lecturer/tests/new"
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Create New Test</span>
          </Link>
        </motion.div>

        {/* Grid of Tests */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-sm"
          >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <LayoutGrid className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Tests Found</h3>
            <p className="text-slate-500 max-w-md mx-auto font-medium text-lg leading-relaxed">You haven't created any tests for your courses yet. Click "Create New Test" to get started.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test: any, i: number) => (
              <motion.div 
                key={test.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 p-6 flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    test.category === 'exam' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                    test.category === 'assignment' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                    'bg-indigo-50 border-indigo-100 text-indigo-700'
                  }`}>
                    {test.category || 'Exam'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">ID: {test.id}</span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-1 relative z-10 group-hover:text-emerald-600 transition-colors">{test.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-8 flex-grow relative z-10 font-medium leading-relaxed">{test.description || 'No description provided.'}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                  <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pass Mark</span>
                    <span className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      {test.pass_mark}%
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled</span>
                    <span className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      Course Only
                    </span>
                  </div>
                </div>

                <Link 
                  href={`/lecturer/tests/${test.slug}`}
                  className="relative z-10 inline-flex items-center justify-between w-full px-5 py-3.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-500/25 group/btn"
                >
                  Manage Engine
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
