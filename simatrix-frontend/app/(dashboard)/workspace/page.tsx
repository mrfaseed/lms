import React, { Suspense } from 'react';
import CodeRunner from './CodeRunner';

export default function WorkspacePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">IDE Workspace</h1>
        <p className="text-slate-600 font-medium mt-2">Write, test, and execute code in various programming languages directly in your browser.</p>
      </div>

      <Suspense fallback={<div className="h-[500px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">Loading workspace...</div>}>
        <CodeRunner />
      </Suspense>
    </div>
  );
}
