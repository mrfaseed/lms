'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Trash2, Plus, Search, BookOpen, AlertCircle } from 'lucide-react';
export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    student_id: '',
    course_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [enrollRes, studentsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/enrollments'),
        fetch('/api/admin/users?role=student&page_size=1000'), // fetching all students for dropdown
        fetch('/api/admin/courses')
      ]);

      if (enrollRes.ok) {
        setEnrollments(await enrollRes.json());
      }
      if (studentsRes.ok) {
        const studentData = await studentsRes.json();
        setStudents(studentData.results || []);
      }
      if (coursesRes.ok) {
        setCourses(await coursesRes.json());
      }
    } catch (error) {
      alert('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredEnrollments = enrollments.filter(e => 
    e.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.student_id || !formData.course_id) {
      alert('Please select both student and course');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: parseInt(formData.student_id),
          course_id: parseInt(formData.course_id)
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Student enrolled successfully');
        setIsModalOpen(false);
        setFormData({ student_id: '', course_id: '' });
        fetchData();
      } else {
        alert(data.error || 'Failed to enroll student');
      }
    } catch (error) {
      alert('Server error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to drop this student from the course?')) return;
    
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Enrollment deleted successfully');
        fetchData();
      } else {
        alert('Failed to delete enrollment');
      }
    } catch (error) {
      alert('Server error');
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enrollments</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage student course assignments.</p>
          </div>
          <button 
            onClick={() => {
              setFormData({ student_id: '', course_id: '' });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            <span>Enroll Student</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by student name or course..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        Loading enrollments...
                      </div>
                    </td>
                  </tr>
                ) : filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="text-slate-500 font-medium">No enrollments found.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div className="font-semibold text-slate-800">{e.student_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{e.course_title}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{e.course_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(e.id)}
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Drop Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Enroll Student</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <AlertCircle className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                  <select 
                    required 
                    value={formData.student_id} 
                    onChange={e => setFormData(f => ({ ...f, student_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                  >
                    <option value="">-- Choose a Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.username} {s.email ? `(${s.email})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
                  <select 
                    required 
                    value={formData.course_id} 
                    onChange={e => setFormData(f => ({ ...f, course_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                  >
                    <option value="">-- Choose a Course --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
