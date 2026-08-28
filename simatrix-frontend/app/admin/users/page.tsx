'use client';

import React, { useEffect, useState } from 'react';
import { Search, Edit2, Trash2, Shield, ShieldOff, MoreVertical } from 'lucide-react';
import Modal from '../components/Modal';

type User = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_superuser?: boolean;
  is_student?: boolean;
  is_lecturer?: boolean;
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [count, setCount] = useState(0);
  const [numPages, setNumPages] = useState(1);

  // Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '' });

  // Delete State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  async function loadUsers(p = page, q = query) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${p}&page_size=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.results ?? data);
        setCount(data.count ?? (data.results ? data.results.length : data.length));
        setNumPages(data.num_pages ?? 1);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadUsers(1, query);
  }

  async function handleToggleAdmin(u: User) {
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_superuser: !u.is_superuser }),
      });
      if (res.ok) loadUsers();
    } catch (err) {
      console.error(err);
    }
  }

  function openEditModal(u: User) {
    setEditingUser(u);
    setEditForm({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email || ''
    });
    setIsEditModalOpen(true);
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function openDeleteModal(u: User) {
    setDeletingUser(u);
    setIsDeleteModalOpen(true);
  }

  async function submitDelete() {
    if (!deletingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Platform Users</h2>
          <p className="text-sm text-slate-500 mt-1">Manage all students, lecturers, and administrators.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <form onSubmit={onSearchSubmit} className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search username or email..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </form>
          <button type="button" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20 whitespace-nowrap">
            Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold uppercase text-xs">
                          {u.username.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{u.username}</div>
                          <div className="text-xs text-slate-500">{(u.first_name || u.last_name) ? `${u.first_name} ${u.last_name}` : 'No name provided'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{u.email || <span className="text-slate-400 italic">No email</span>}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {u.is_superuser && <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">SUPERUSER</span>}
                        {u.is_lecturer && <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">LECTURER</span>}
                        {u.is_student && <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">STUDENT</span>}
                        {!u.is_superuser && !u.is_lecturer && !u.is_student && <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200">USER</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleAdmin(u)}
                          title={u.is_superuser ? "Revoke Admin" : "Make Admin"}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.is_superuser ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          {u.is_superuser ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => openEditModal(u)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(u)}
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
              Showing page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{numPages}</span> ({count} total records)
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => { setPage(p => p - 1); loadUsers(page - 1, query); }} 
                disabled={page <= 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors font-medium shadow-sm"
              >
                Previous
              </button>
              <button 
                onClick={() => { setPage(p => p + 1); loadUsers(page + 1, query); }} 
                disabled={page >= numPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors font-medium shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User Details">
        <form onSubmit={submitEdit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">First Name</label>
            <input 
              type="text" 
              value={editForm.first_name} 
              onChange={e => setEditForm({...editForm, first_name: e.target.value})} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Last Name</label>
            <input 
              type="text" 
              value={editForm.last_name} 
              onChange={e => setEditForm({...editForm, last_name: e.target.value})} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input 
              type="email" 
              value={editForm.email} 
              onChange={e => setEditForm({...editForm, email: e.target.value})} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Are you sure you want to delete <span className="font-bold text-slate-800">{deletingUser?.username}</span>? This action cannot be undone and will permanently remove all associated data.
          </p>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={submitDelete} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors shadow-sm">
              Permanently Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
