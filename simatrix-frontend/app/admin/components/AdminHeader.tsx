'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu } from 'lucide-react';

export default function AdminHeader() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname.startsWith('/admin/users')) return 'User Management';
    if (pathname.startsWith('/admin/courses')) return 'Course Management';
    if (pathname.startsWith('/admin/settings')) return 'Platform Settings';
    return 'Admin Panel';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-slate-500 hover:text-slate-700">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
          />
        </div>

        <button className="relative text-slate-400 hover:text-slate-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-700 leading-none">Admin User</div>
            <div className="text-xs text-slate-500 mt-1">Superuser</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            AU
          </div>
        </div>
      </div>
    </header>
  );
}
