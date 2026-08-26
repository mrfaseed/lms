import React from "react";
import Link from "next/link";
import { logoutUser } from '../login/actions';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden w-full bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex border-r border-slate-800">
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Simatrix Admin
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <svg className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 text-sm text-slate-500 text-center">
          &copy; {new Date().getFullYear()} Simatrix
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
          <div className="flex items-center md:hidden">
            <h1 className="text-xl font-bold text-gray-900 tracking-wider">Simatrix Admin</h1>
          </div>
          <div className="hidden md:flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            System Online
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md cursor-pointer ring-2 ring-white hover:scale-105 transition-transform">
                A
              </div>
              <form action={logoutUser}>
                <button type="submit" className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50">
                  Log out
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
