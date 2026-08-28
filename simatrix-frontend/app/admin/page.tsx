'use client';

import React, { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Stats = {
  total_students: number;
  total_courses: number;
  total_active_programs: number;
};

// Mock data for the activity chart to make it look premium
const activityData = [
  { name: 'Mon', active: 400, new: 24 },
  { name: 'Tue', active: 300, new: 13 },
  { name: 'Wed', active: 550, new: 55 },
  { name: 'Thu', active: 450, new: 39 },
  { name: 'Fri', active: 700, new: 80 },
  { name: 'Sat', active: 650, new: 45 },
  { name: 'Sun', active: 800, new: 110 },
];

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="w-16 h-16 text-indigo-600" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <h3 className="text-3xl font-bold text-slate-800">
                {loading ? <span className="animate-pulse bg-slate-200 text-transparent rounded">000</span> : stats?.total_students ?? 0}
              </h3>
            </div>
          </div>
          <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded">
            <TrendingUp className="w-4 h-4 mr-1" /> +12% this week
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <BookOpen className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Courses</p>
              <h3 className="text-3xl font-bold text-slate-800">
                {loading ? <span className="animate-pulse bg-slate-200 text-transparent rounded">000</span> : stats?.total_courses ?? 0}
              </h3>
            </div>
          </div>
          <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded">
            <TrendingUp className="w-4 h-4 mr-1" /> +3% this week
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-16 h-16 text-rose-600" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Programs</p>
              <h3 className="text-3xl font-bold text-slate-800">
                {loading ? <span className="animate-pulse bg-slate-200 text-transparent rounded">000</span> : stats?.total_active_programs ?? 0}
              </h3>
            </div>
          </div>
          <div className="flex items-center text-sm font-medium text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100">
            Stable
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Platform Engagement
            </h3>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                <Area type="monotone" dataKey="new" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Quick Actions</h3>
          <div className="space-y-4 flex-1">
            <button className="w-full flex items-center justify-between p-4 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-medium border border-indigo-100">
              <span className="flex items-center gap-3"><Users className="w-5 h-5"/> Add New User</span>
              <span>&rarr;</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-medium border border-emerald-100">
              <span className="flex items-center gap-3"><BookOpen className="w-5 h-5"/> Create Course</span>
              <span>&rarr;</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors font-medium border border-amber-100">
              <span className="flex items-center gap-3"><Activity className="w-5 h-5"/> View Reports</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
