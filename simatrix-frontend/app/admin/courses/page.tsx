'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Edit2, Trash2, BookOpen, Video, FileText, Plus } from 'lucide-react';
import Modal from '../components/Modal';

type Course = {
  id: number;
  slug: string;
  title: string;
  code: string;
  is_elective: boolean;
  program: number;
  uploads: any[];
  videos: any[];
  quizzes: any[];
  is_published: boolean;
  is_promoted: boolean;
  enrollment_strategy: string;
};

type Program = {
  id: number;
  title: string;
};

export default function CoursesManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Client-side pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function loadCourses() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPrograms() {
    try {
      const res = await fetch(`/api/admin/programs`);
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch (err) {
      console.error('Failed to load programs', err);
    }
  }

  useEffect(() => {
    loadCourses();
    loadPrograms();
  }, []);

  // Filter and paginate client-side
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const lowerQuery = searchQuery.toLowerCase();
    return courses.filter(c => 
      c.title?.toLowerCase().includes(lowerQuery) || 
      c.code?.toLowerCase().includes(lowerQuery)
    );
  }, [courses, searchQuery]);

  const numPages = Math.ceil(filteredCourses.length / pageSize) || 1;
  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    summary: '',
    program: '',
    is_published: false,
    is_promoted: false,
    enrollment_strategy: 'OPEN',
  });

  function handleOpenModal(type: 'create' | 'edit', course?: Course) {
    setModalType(type);
    if (type === 'edit' && course) {
      setEditingCourse(course);
      setFormData({
        title: course.title || '',
        code: course.code || '',
        summary: course.summary || '',
        program: course.program?.toString() || '',
        is_published: course.is_published || false,
        is_promoted: course.is_promoted || false,
        enrollment_strategy: course.enrollment_strategy || 'OPEN',
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        code: '',
        summary: '',
        program: '',
        is_published: false,
        is_promoted: false,
        enrollment_strategy: 'OPEN',
      });
    }
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = modalType === 'create' ? '/api/admin/courses' : `/api/admin/courses/${editingCourse?.slug}`;
      const method = modalType === 'create' ? 'POST' : 'PATCH';

      const payload: any = {
        ...formData
      };
      
      if (formData.program) {
        payload.program = parseInt(formData.program);
      } else {
        payload.program = null;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`Course successfully ${modalType === 'create' ? 'created' : 'updated'}!`);
        setIsModalOpen(false);
        loadCourses();
      } else {
        const err = await res.json();
        alert(`Failed to save course: ${JSON.stringify(err)}`);
      }
    } catch (err) {
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/courses/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Course deleted successfully.');
        loadCourses();
      } else {
        alert('Failed to delete course.');
      }
    } catch (err) {
      alert('An unexpected error occurred.');
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Course Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage platform courses, modules, and content.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by title, code, or level..." 
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => handleOpenModal('create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20 whitespace-nowrap flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Course Info</th>
                <th className="px-6 py-4">Content Stats</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500">Loading courses...</p>
                  </td>
                </tr>
              ) : paginatedCourses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No courses found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedCourses.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center flex-wrap gap-2">
                            {c.title}
                            {!c.program && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider font-bold rounded-full">
                                Individual
                              </span>
                            )}
                            {!c.is_published && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] uppercase tracking-wider font-bold rounded-full">
                                Draft
                              </span>
                            )}
                            {c.is_promoted && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] uppercase tracking-wider font-bold rounded-full">
                                ★ Featured
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{c.code}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1.5 text-slate-500" title="PDF/Doc Uploads">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium">{c.uploads?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500" title="Video Lectures">
                          <Video className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{c.videos?.length || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal('edit', c)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.slug)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {numPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Showing page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{numPages}</span> ({filteredCourses.length} total records)
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => p - 1)} 
                disabled={page <= 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors font-medium shadow-sm"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={page >= numPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors font-medium shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'create' ? 'Create New Course' : 'Edit Course'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
              <input 
                required 
                value={formData.title} 
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
              <input 
                required 
                value={formData.code} 
                onChange={e => setFormData(f => ({ ...f, code: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
              <select 
                value={formData.program} 
                onChange={e => setFormData(f => ({ ...f, program: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
              >
                <option value="">Individual Course</option>
                <option disabled>── Programs ──</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Summary</label>
              <textarea 
                rows={2}
                value={formData.summary} 
                onChange={e => setFormData(f => ({ ...f, summary: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
              />
            </div>
            
            <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Visibility & Enrollment Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.is_published}
                      onChange={e => setFormData(f => ({ ...f, is_published: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-800">Published</div>
                      <div className="text-xs text-slate-500">Visible to students in catalog</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.is_promoted}
                      onChange={e => setFormData(f => ({ ...f, is_promoted: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-800">Featured Course</div>
                      <div className="text-xs text-slate-500">Highlight at the top of catalog</div>
                    </div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enrollment Strategy</label>
                  <select 
                    value={formData.enrollment_strategy} 
                    onChange={e => setFormData(f => ({ ...f, enrollment_strategy: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                  >
                    <option value="OPEN">Open (Instant Join)</option>
                    <option value="APPROVAL">Approval Required</option>
                    <option value="CLOSED">Closed (Not accepting)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
