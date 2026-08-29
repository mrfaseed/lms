'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Edit2, Trash2, BookOpen, Plus } from 'lucide-react';
import Modal from '../components/Modal';

type Program = {
  id: number;
  title: string;
  summary: string;
};

export default function ProgramsManagementPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Client-side pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function loadPrograms() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/programs`);
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch (err) {
      console.error('Failed to load programs', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  // Filter and paginate client-side
  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return programs;
    const lowerQuery = searchQuery.toLowerCase();
    return programs.filter(p => 
      p.title?.toLowerCase().includes(lowerQuery) || 
      p.summary?.toLowerCase().includes(lowerQuery)
    );
  }, [programs, searchQuery]);

  const numPages = Math.ceil(filteredPrograms.length / pageSize) || 1;
  const paginatedPrograms = filteredPrograms.slice((page - 1) * pageSize, page * pageSize);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
  });

  function handleOpenModal(type: 'create' | 'edit', program?: Program) {
    setModalType(type);
    if (type === 'edit' && program) {
      setEditingProgram(program);
      setFormData({
        title: program.title || '',
        summary: program.summary || '',
      });
    } else {
      setEditingProgram(null);
      setFormData({
        title: '',
        summary: '',
      });
    }
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = modalType === 'create' ? '/api/admin/programs' : `/api/admin/programs/${editingProgram?.id}`;
      const method = modalType === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(`Program successfully ${modalType === 'create' ? 'created' : 'updated'}!`);
        setIsModalOpen(false);
        loadPrograms();
      } else {
        const err = await res.json();
        alert(`Failed to save program: ${JSON.stringify(err)}`);
      }
    } catch (err) {
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone and will delete all associated courses.')) return;
    try {
      const res = await fetch(`/api/admin/programs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Program deleted successfully.');
        loadPrograms();
      } else {
        alert('Failed to delete program.');
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
          <h2 className="text-xl font-bold text-slate-800">Program Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage academic programs containing courses.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search programs..." 
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
            <Plus className="w-4 h-4" /> Add Program
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Program Info</th>
                <th className="px-6 py-4">Summary</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500">Loading programs...</p>
                  </td>
                </tr>
              ) : paginatedPrograms.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    No programs found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedPrograms.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="font-semibold text-slate-800">{p.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 line-clamp-2">{p.summary || 'No summary available.'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal('edit', p)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
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
              Showing page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{numPages}</span> ({filteredPrograms.length} total records)
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'create' ? 'Create New Program' : 'Edit Program'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Program Title</label>
            <input 
              required 
              value={formData.title} 
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Summary</label>
            <textarea 
              rows={4}
              value={formData.summary} 
              onChange={e => setFormData(f => ({ ...f, summary: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
            />
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
              {isSubmitting ? 'Saving...' : 'Save Program'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
