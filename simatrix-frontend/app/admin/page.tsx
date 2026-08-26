'use client';

import React, { useEffect, useState } from 'react';

type Stats = {
  total_students: number;
  total_courses: number;
  total_active_programs: number;
};

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

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [count, setCount] = useState(0);
  const [numPages, setNumPages] = useState(1);

  async function loadStats() {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoadingStats(false);
    }
  }

  async function loadUsers(p = page, q = query) {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?page=${p}&page_size=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.results ?? data);
        setCount(data.count ?? (data.results ? data.results.length : data.length));
        setNumPages(data.num_pages ?? 1);
      } else {
        console.error('Failed to load users', await res.text());
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadStats();
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
      if (res.ok) {
        loadUsers();
      } else {
        alert('Failed to update user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    }
  }

  async function handleDelete(u: User) {
    if (!confirm(`Delete user ${u.username}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
      if (res.ok) {
        loadUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  }

  async function handleEdit(u: User) {
    const first = prompt('First name', u.first_name ?? '');
    if (first === null) return;
    const last = prompt('Last name', u.last_name ?? '');
    if (last === null) return;
    const email = prompt('Email', u.email ?? '');
    if (email === null) return;

    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: first, last_name: last, email }),
      });
      if (res.ok) {
        loadUsers();
      } else {
        alert('Failed to update user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    }
  }

  function prevPage() {
    if (page > 1) {
      const p = page - 1;
      setPage(p);
      loadUsers(p);
    }
  }

  function nextPage() {
    if (page < numPages) {
      const p = page + 1;
      setPage(p);
      loadUsers(p);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </header>

      <section>
        <h2 className="sr-only">Platform summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-lg p-5 flex items-center">
            <div className="p-3 bg-blue-50 rounded-full mr-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4M5 20h14a1 1 0 001-1v-6a4 4 0 00-4-4H8a4 4 0 00-4 4v6a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Students</div>
              <div className="text-2xl font-semibold">
                {loadingStats ? '—' : stats?.total_students ?? 0}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5 flex items-center">
            <div className="p-3 bg-green-50 rounded-full mr-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Courses</div>
              <div className="text-2xl font-semibold">
                {loadingStats ? '—' : stats?.total_courses ?? 0}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5 flex items-center">
            <div className="p-3 bg-purple-50 rounded-full mr-4">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Active Programs</div>
              <div className="text-2xl font-semibold">
                {loadingStats ? '—' : stats?.total_active_programs ?? 0}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">User Management</h3>
            <form onSubmit={onSearchSubmit} className="flex items-center space-x-2">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users" className="px-3 py-2 border rounded" />
              <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Search</button>
            </form>
          </div>

          {loadingUsers ? (
            <div className="py-10 text-center text-gray-500">Loading users…</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(u.first_name || u.last_name) ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email ?? '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.is_student ? 'Student' : u.is_lecturer ? 'Lecturer' : 'User'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.is_superuser ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(u)} className="text-sm text-blue-600">Edit</button>
                            <button onClick={() => handleToggleAdmin(u)} className="text-sm text-green-600">{u.is_superuser ? 'Revoke Admin' : 'Make Admin'}</button>
                            <button onClick={() => handleDelete(u)} className="text-sm text-red-600">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">Showing page {page} of {numPages} — {count} users</div>
                <div className="flex items-center space-x-2">
                  <button onClick={prevPage} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                  <button onClick={nextPage} disabled={page >= numPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
