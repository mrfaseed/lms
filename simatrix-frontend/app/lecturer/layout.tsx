import Link from 'next/link';
import { logoutUser } from '../login/actions';

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden w-full bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg">S</div>
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Simatrix</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2">Lecturer Portal</div>
          
          <Link href="/lecturer" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all group">
            <svg className="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            My Courses
          </Link>
          
          <Link href="/lecturer/gradebook" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all group">
            <svg className="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Gradebook
          </Link>
          
        </nav>

        <div className="p-4 border-t border-slate-800 text-sm text-slate-500 text-center">
          &copy; {new Date().getFullYear()} Simatrix LMS
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
          <div className="flex items-center md:hidden">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg mr-3">S</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-wider">Simatrix</h1>
          </div>
          
          <div className="hidden md:flex flex-1">
             <h2 className="text-lg font-semibold text-slate-700">Lecturer Workspace</h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 pl-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md cursor-pointer border-2 border-white ring-2 ring-slate-100">
                L
              </div>
              <form action={logoutUser}>
                <button type="submit" className="text-sm text-slate-500 hover:text-rose-600 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50">
                  Log out
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
