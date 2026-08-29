'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

export default function AllocationForm({ allocId, lecturers, courses }: { allocId?: number, lecturers?: any[], courses?: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!allocId) return;
    if (!confirm('Are you sure you want to remove this allocation?')) return;
    
    setLoading(true);
    const res = await fetch(`/api/admin/allocations/${allocId}`, {
      method: 'DELETE'
    });
    setLoading(false);
    
    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to delete allocation');
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const lecturer_id = formData.get('lecturer_id');
    const course_ids = formData.getAll('course_ids'); 

    if (!lecturer_id) {
      alert('Please select a lecturer.');
      return;
    }
    
    if (!course_ids || course_ids.length === 0) {
      alert('Please select at least one course.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/admin/allocations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lecturer_id, course_ids: course_ids.map(Number) })
    });
    
    setLoading(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to create allocation');
    }
  }

  if (allocId) {
    return (
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
        title="Remove Allocation"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Select Lecturer</label>
        <select 
          name="lecturer_id" 
          required
          defaultValue=""
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="" disabled>-- Choose Lecturer --</option>
          {lecturers && lecturers.length > 0 ? (
            lecturers.map(l => (
              <option key={l.id} value={l.id}>{l.username} ({l.get_full_name || l.email})</option>
            ))
          ) : (
            <option disabled value="">No lecturers found from server</option>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Select Courses</label>
        <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-lg">
          {courses?.map(c => (
            <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-slate-200">
              <input type="checkbox" name="course_ids" value={c.id} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-700">{c.title} <span className="text-slate-400 text-xs ml-1">({c.code})</span></span>
            </label>
          ))}
          {(!courses || courses.length === 0) && (
            <div className="text-sm text-slate-500 text-center p-2">No courses available.</div>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Allocate Courses
      </button>
    </form>
  );
}
