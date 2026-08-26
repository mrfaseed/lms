import React from 'react';
import Link from 'next/link';

// Helper to determine badge colors based on grade
const getGradeColor = (grade: string) => {
  if (grade?.startsWith('A')) return 'bg-green-100 text-green-800';
  if (grade?.startsWith('B')) return 'bg-blue-100 text-blue-800';
  if (grade?.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
  if (grade === 'F' || grade === 'NG') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

async function getTranscript() {
  // Hardcoded to Student ID 2 for demo purposes
  const res = await fetch('http://127.0.0.1:8000/api/result/transcript/2/', { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch transcript');
  }
  
  return res.json();
}

export default async function ProgressPage() {
  const data = await getTranscript();
  const { student_name, student_id, program, transcript } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Progress</h1>
        <p className="text-gray-600">Review your coding assignments and academy progress.</p>
      </div>

      {/* Student Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-6 md:mb-0">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md mr-6">
            {student_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student_name}</h2>
            <p className="text-gray-500 font-medium">{program} &bull; ID: {student_id}</p>
          </div>
        </div>
        <div className="flex space-x-6 text-center">
          <div className="bg-gray-50 rounded-xl px-6 py-4 border border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Courses Passed</p>
            <p className="text-4xl font-extrabold text-blue-600">{transcript.filter((t: any) => t.comment === 'PASS').length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-6 py-4 border border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Score</p>
            <p className="text-4xl font-extrabold text-indigo-600">{transcript.reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0).toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Transcript Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Completed Courses</h2>
          <span className="text-sm font-medium text-gray-500">{transcript.length} courses on record</span>
        </div>
        
        {transcript.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No grades available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-5 font-medium">Course Code</th>
                  <th className="p-5 font-medium">Course Title</th>
                  <th className="p-5 font-medium text-center">Total Score</th>
                  <th className="p-5 font-medium text-center">Letter Grade</th>
                  <th className="p-5 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transcript.map((tc: any) => (
                  <tr key={tc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-semibold text-gray-900">{tc.course_code}</td>
                    <td className="p-5 text-gray-600">
                      <Link href={`/courses/${tc.course_code}`} className="hover:text-blue-600 hover:underline">
                        {tc.course_title}
                      </Link>
                    </td>
                    <td className="p-5 text-center font-bold text-gray-900">{tc.total}</td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full shadow-sm ${getGradeColor(tc.grade)}`}>
                        {tc.grade}
                      </span>
                    </td>
                    <td className="p-5 text-center font-semibold text-gray-500">
                      {tc.comment === 'PASS' ? (
                        <span className="text-green-600 flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          PASS
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          FAIL
                        </span>
                      )}
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
