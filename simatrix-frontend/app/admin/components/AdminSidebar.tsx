'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Programs', href: '/admin/programs', icon: BookOpen },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Enrollments', href: '/admin/enrollments', icon: BookOpen },
    { name: 'Tests Engine', href: '/admin/tests', icon: BookOpen },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Allocations', href: '/admin/allocations', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-[#1e1e2d] text-slate-300 flex flex-col border-r border-[#2b2b3c] flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[#2b2b3c]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            S
          </div>
          <span className="font-bold text-lg text-white tracking-wide">Simatrix Admin</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group cursor-pointer ${
                  isActive ? 'text-white bg-[#2b2b3c]' : 'hover:text-white hover:bg-[#252535]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-500 rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#2b2b3c]">
        <Link href="/login">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer text-slate-400">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
