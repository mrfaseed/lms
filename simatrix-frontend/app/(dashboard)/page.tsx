import React from 'react';
import { getStudentDashboardStats } from './actions';
import { redirect } from 'next/navigation';
import DashboardView from './DashboardView';

export default async function DashboardPage() {
  const stats = await getStudentDashboardStats();

  if (stats.error) {
    if (stats.error === 'Not authenticated') {
      redirect('/login');
    }
    return (
      <div className="max-w-7xl mx-auto p-8 bg-red-50 text-red-700 rounded-xl">
        Failed to load dashboard: {stats.error}
      </div>
    );
  }

  return <DashboardView stats={stats} />;
}
