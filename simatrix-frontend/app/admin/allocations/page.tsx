import React from 'react';
import { cookies } from 'next/headers';
import { Shield, BookOpen, Trash2, Plus } from 'lucide-react';
import AllocationForm from './AllocationForm';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000';

async function fetchAllocations() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const res = await fetch(`${DJANGO_API_URL}/api/programs/allocations/`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

async function fetchLecturers() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const res = await fetch(`${DJANGO_API_URL}/accounts/api/admin/users/?role=lecturer&page_size=1000`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("fetchLecturers failed:", res.status, res.statusText, errorText);
    return [];
  }
  const data = await res.json();
  const users = data.results || data || [];
  console.log("fetchLecturers success, found users:", Array.isArray(users) ? users.length : 'not array');
  // Filter only lecturers just in case
  return Array.isArray(users) ? users : [];
}

async function fetchCourses() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const res = await fetch(`${DJANGO_API_URL}/api/programs/courses/`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AllocationsPage() {
  const allocations = await fetchAllocations();
  const lecturers = await fetchLecturers();
  const courses = await fetchCourses();

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Course Allocations</h1>
          <p className="text-slate-500 mt-2">Manage which courses are taught by which lecturers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {allocations.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              No allocations found. Create one to get started.
            </div>
          ) : (
            allocations.map((alloc: any) => (
              <div key={alloc.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                      {alloc.lecturer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{alloc.lecturer_name}</h3>
                      <p className="text-sm text-slate-500">Lecturer</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {alloc.courses.map((c: any) => (
                      <div key={c.id} className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        {c.title} <span className="text-slate-400 ml-auto">{c.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start">
                  <AllocationForm allocId={alloc.id} />
                </div>
              </div>
            ))
          )}
        </div>
        
        <div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-6">
            <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              New Allocation
            </h2>
            <AllocationForm lecturers={lecturers} courses={courses} />
          </div>
        </div>
      </div>
    </div>
  );
}
