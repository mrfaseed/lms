'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Grade = {
  id: number;
  student_id: number;
  student_name: string;
  course_code: string;
  course_title: string;
  assignment: number;
  mid_exam: number;
  quiz: number;
  attendance: number;
  final_exam: number;
  total: number;
  grade: string;
  point: number;
  comment: string;
};

type Course = {
  id: number;
  title: string;
  code: string;
};

export default function GradebookView({ 
  initialGrades, 
  courses,
  token,
  lecturerId,
  initialCourseId
}: { 
  initialGrades: Grade[], 
  courses: Course[],
  token: string,
  lecturerId: number,
  initialCourseId?: string
}) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId ?? (courses.length > 0 ? courses[0].id.toString() : ''));
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Grade>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredGrades = grades.filter(g => courses.find(c => c.id.toString() === selectedCourseId)?.code === g.course_code);

  const handleEdit = (grade: Grade) => {
    setEditingId(grade.id);
    setEditForm({
      assignment: grade.assignment,
      mid_exam: grade.mid_exam,
      quiz: grade.quiz,
      attendance: grade.attendance,
      final_exam: grade.final_exam
    });
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/result/lecturer/${lecturerId}/grades/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id,
          ...editForm
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGrades(prev => prev.map(g => {
          if (g.id === id) {
            return {
              ...g,
              ...editForm,
              total: data.total,
              grade: data.grade
            };
          }
          return g;
        }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        alert("Failed to save grades.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving grades.");
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gradebook</h1>
          <p className="text-slate-600 font-medium">Manage and update student marks interactively.</p>
        </div>
        
        <div className="flex-shrink-0">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Select Course</label>
          <select 
            className="w-full md:w-64 border border-slate-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.length === 0 && <option value="">No courses assigned</option>}
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
            ))}
          </select>
        </div>
      </div>

      {saveSuccess && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          exit={{ opacity: 0, height: 0 }}
          className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-semibold"
        >
          ✅ Grades successfully saved and totals recalculated.
        </motion.div>
      )}

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        {filteredGrades.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No students enrolled in this course yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4 pl-6">Student</th>
                  <th className="p-4">Assignment (10)</th>
                  <th className="p-4">Mid Exam (30)</th>
                  <th className="p-4">Quiz (10)</th>
                  <th className="p-4">Attendance (10)</th>
                  <th className="p-4">Final (40)</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4 pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-800">
                      {grade.student_name}
                    </td>
                    
                    {/* Columns for grades */}
                    {editingId === grade.id ? (
                      <>
                        <td className="p-4"><input type="number" min="0" max="10" className="w-16 border rounded px-2 py-1 text-center font-medium" value={editForm.assignment ?? ''} onChange={e => setEditForm({...editForm, assignment: Number(e.target.value)})} /></td>
                        <td className="p-4"><input type="number" min="0" max="30" className="w-16 border rounded px-2 py-1 text-center font-medium" value={editForm.mid_exam ?? ''} onChange={e => setEditForm({...editForm, mid_exam: Number(e.target.value)})} /></td>
                        <td className="p-4"><input type="number" min="0" max="10" className="w-16 border rounded px-2 py-1 text-center font-medium" value={editForm.quiz ?? ''} onChange={e => setEditForm({...editForm, quiz: Number(e.target.value)})} /></td>
                        <td className="p-4"><input type="number" min="0" max="10" className="w-16 border rounded px-2 py-1 text-center font-medium" value={editForm.attendance ?? ''} onChange={e => setEditForm({...editForm, attendance: Number(e.target.value)})} /></td>
                        <td className="p-4"><input type="number" min="0" max="40" className="w-16 border rounded px-2 py-1 text-center font-medium" value={editForm.final_exam ?? ''} onChange={e => setEditForm({...editForm, final_exam: Number(e.target.value)})} /></td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 font-medium text-slate-600">{grade.assignment}</td>
                        <td className="p-4 font-medium text-slate-600">{grade.mid_exam}</td>
                        <td className="p-4 font-medium text-slate-600">{grade.quiz}</td>
                        <td className="p-4 font-medium text-slate-600">{grade.attendance}</td>
                        <td className="p-4 font-medium text-slate-600">{grade.final_exam}</td>
                      </>
                    )}

                    <td className="p-4 font-bold text-slate-900">{grade.total}</td>
                    <td className="p-4 font-bold text-indigo-600">{grade.grade || '-'}</td>
                    
                    <td className="p-4 pr-6">
                      {editingId === grade.id ? (
                        <div className="flex gap-2">
                          <button 
                            disabled={saving}
                            onClick={() => handleSave(grade.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            disabled={saving}
                            onClick={() => setEditingId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleEdit(grade)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
