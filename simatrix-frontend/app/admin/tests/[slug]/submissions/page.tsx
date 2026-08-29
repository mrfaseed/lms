'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function SubmissionsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [sittings, setSittings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSittings();
  }, []);

  const fetchSittings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tests/${slug}/sittings`);
      if (res.ok) {
        const data = await res.json();
        setSittings(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleReset = async (id: number) => {
    if (!confirm('Are you sure you want to reset this sitting? The student will be allowed to retake the test from scratch.')) return;
    
    try {
      const res = await fetch(`/api/admin/sittings/${id}/reset`, { method: 'DELETE' });
      if (res.ok) {
        fetchSittings();
      } else {
        alert('Failed to reset sitting');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/tests" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">&larr; Back to Tests</Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Submissions & Sittings</h1>
          <p className="text-slate-600 mt-1 font-medium">Manage student progress and strict-mode violations.</p>
        </div>
        <button onClick={fetchSittings} className="bg-white border border-slate-200 p-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : sittings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No students have started this test yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Violation</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sittings.map((sitting) => (
                  <tr key={sitting.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-bold text-slate-900">{sitting.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sitting.terminated ? (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded flex items-center w-fit gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" /> Terminated
                        </span>
                      ) : sitting.complete ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded flex items-center w-fit gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">In Progress</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sitting.complete ? `${sitting.get_percent_correct}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-rose-600 max-w-xs truncate">
                      {sitting.terminated ? sitting.violation_reason || 'Unknown Violation' : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleReset(sitting.id)}
                        className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors inline-flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Reset Sitting
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
