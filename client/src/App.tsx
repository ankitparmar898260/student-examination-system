import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center">
        <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          SE
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Student Examination System</h1>
        <p className="text-sm text-slate-600 mb-6">
          Dev server ready. Awaiting your module planning and requirements before writing any code.
        </p>
        <div className="text-xs text-slate-400 font-mono">
          client/src/ &bull; Ready for planning
        </div>
      </div>
    </div>
  );
}
