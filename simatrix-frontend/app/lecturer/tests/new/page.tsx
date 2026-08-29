'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createQuiz } from '../actions';
import { ArrowLeft, Save, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LecturerCreateTestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    // Basic fetch from existing route proxy or directly to backend for lecturer courses
    // Assuming /api/lecturer/courses returns courses allocated to this lecturer
    fetch('/api/lecturer/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Could not fetch courses", err));
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    
    const res = await createQuiz(formData);
    
    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      router.push('/lecturer/tests');
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center gap-4">
        <Link href="/lecturer/tests" className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Test</h1>
          <p className="text-slate-500 text-sm mt-1">Configure a new strict-mode examination for your students.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-bold text-slate-700">Test Title</label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. Midterm Examination 2026"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-bold text-slate-700">Instructions / Description</label>
            <textarea 
              name="description" 
              id="description" 
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Provide rules and instructions for this test..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="course_id" className="block text-sm font-bold text-slate-700">Assign to Course</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select 
                  name="course_id" 
                  id="course_id" 
                  required
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none bg-white"
                >
                  <option value="">Select a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-bold text-slate-700">Test Category</label>
              <select 
                name="category" 
                id="category" 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="exam">Final Exam</option>
                <option value="assignment">Assignment</option>
                <option value="practice">Practice Quiz</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="pass_mark" className="block text-sm font-bold text-slate-700">Pass Mark (%)</label>
              <input 
                type="number" 
                name="pass_mark" 
                id="pass_mark" 
                min="0"
                max="100"
                defaultValue="50"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link 
              href="/lecturer/tests"
              className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSubmitting ? 'Creating...' : 'Create Test'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
