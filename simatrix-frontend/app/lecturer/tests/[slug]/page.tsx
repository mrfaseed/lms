'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchQuizDetails, fetchQuizQuestions, createQuestion, uploadExcelQuestions } from '../actions';
import { ArrowLeft, Plus, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function LecturerTestDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Add Question Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for File Upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [slug]);

  async function loadData() {
    setLoading(true);
    const [testData, qData] = await Promise.all([
      fetchQuizDetails(slug),
      fetchQuizQuestions(slug)
    ]);
    
    // If not found, it might be due to permissions or it doesn't exist
    if (testData?.detail) {
      setTest(null);
    } else {
      setTest(testData);
      setQuestions(qData);
    }
    setLoading(false);
  }

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await uploadExcelQuestions(slug, formData);
    
    if (res.error) {
      setUploadMsg({ type: 'error', text: res.error });
    } else {
      setUploadMsg({ type: 'success', text: `Successfully imported ${res.count} questions!` });
      setFile(null);
      await loadData();
    }
    setUploading(false);
  };

  const handleManualAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const fd = new FormData(e.currentTarget);
    const payload = {
      content: fd.get('content'),
      explanation: fd.get('explanation'),
      choices: [
        { choice: fd.get('choiceA'), correct: fd.get('correctAnswer') === 'A' },
        { choice: fd.get('choiceB'), correct: fd.get('correctAnswer') === 'B' },
        { choice: fd.get('choiceC'), correct: fd.get('correctAnswer') === 'C' },
        { choice: fd.get('choiceD'), correct: fd.get('correctAnswer') === 'D' },
      ].filter(c => c.choice) // remove empty choices
    };

    const res = await createQuestion(slug, payload);
    if (res.error) {
      alert(res.error);
    } else {
      setShowAddModal(false);
      await loadData();
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (!test) return <div className="p-12 text-center font-bold text-slate-700">Test not found, or you do not have permission.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/lecturer/tests" className="p-2 hover:bg-white bg-slate-50 border border-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-widest">
                {test.category}
              </span>
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                Pass: {test.pass_mark}%
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Questions List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Questions ({questions.length})</h2>
          
          {questions.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center">
              <p className="text-slate-500 font-medium">No questions added yet. Use the upload tool or add manually.</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-lg">{q.content}</p>
                    
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.choices.map((c: any, i: number) => (
                        <div key={c.id} className={`p-3 rounded-xl border ${c.correct ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-start gap-2">
                            <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${c.correct ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                              {c.correct && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className={`text-sm font-medium ${c.correct ? 'text-emerald-900' : 'text-slate-600'}`}>{c.choice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {q.explanation && (
                      <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Bulk Upload Widget */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Bulk Import (Excel/CSV)
            </h3>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
            >
              <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${file ? 'text-emerald-500' : 'text-slate-400'}`} />
              
              {file ? (
                <div>
                  <p className="font-bold text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Ready to upload</p>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-rose-500 text-xs font-bold mt-3 hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-700">Drag & Drop file here</p>
                  <p className="text-xs text-slate-500 mt-1">or</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-indigo-600 text-sm font-bold hover:underline"
                  >
                    Browse files
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                    }}
                  />
                </div>
              )}
            </div>

            {uploadMsg && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${uploadMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {uploadMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {uploadMsg.text}
              </div>
            )}

            <button 
              onClick={handleFileUpload}
              disabled={!file || uploading}
              className="w-full mt-4 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? 'Processing...' : 'Upload & Import'}
            </button>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-2">Required Columns:</p>
              <div className="flex flex-wrap gap-2">
                {['Question', 'Choice A', 'Choice B', 'Choice C', 'Choice D', 'Correct Answer', 'Explanation'].map(c => (
                  <span key={c} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">Add Question</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleManualAdd} className="p-6 space-y-6">
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Question Text</label>
                <textarea 
                  name="content" 
                  required
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="What is the capital of France?"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Choices & Correct Answer</label>
                
                {['A', 'B', 'C', 'D'].map((letter) => (
                  <div key={letter} className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="correctAnswer" 
                      value={letter}
                      required
                      className="w-5 h-5 text-emerald-500 focus:ring-emerald-500 border-slate-300"
                    />
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{letter}</span>
                      <input 
                        type="text" 
                        name={`choice${letter}`}
                        required={letter === 'A' || letter === 'B'} // Only A and B required
                        className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder={`Choice ${letter}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Explanation (Optional)</label>
                <textarea 
                  name="explanation" 
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Paris is the capital..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Add to Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
