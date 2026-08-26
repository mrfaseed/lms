'use client';

import React, { useState, useEffect } from 'react';
import { getQuizState, submitQuizAnswer } from './actions';
import Link from 'next/link';
import { use } from 'react';

export default function QuizPage({ params }: { params: Promise<{ slug: string, quiz_slug: string }> }) {
  const resolvedParams = use(params);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    const data = await getQuizState(resolvedParams.quiz_slug);
    if (data.error) {
      setError(data.error);
    } else {
      setQuizState(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuiz();
  }, [resolvedParams.quiz_slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnswer) return;

    setSubmitting(true);
    const result = await submitQuizAnswer(resolvedParams.quiz_slug, selectedAnswer);
    
    if (result.error) {
      setError(result.error);
    } else {
      // Clear selection and fetch next question
      setSelectedAnswer(null);
      await fetchQuiz();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-red-50 border border-red-200 p-8 rounded-2xl text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h2 className="text-2xl font-bold text-red-700 mb-2">Quiz Error</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <Link href={`/courses/${resolvedParams.slug}`} className="bg-white text-red-700 font-bold py-2 px-6 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
          Return to Course
        </Link>
      </div>
    );
  }

  // Quiz is finished
  if (quizState?.complete) {
    const { sitting } = quizState;
    const passed = sitting.check_if_passed;
    
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center p-12">
          {passed ? (
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
          )}
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {passed ? 'Congratulations!' : 'Keep Trying!'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            You scored <strong className="text-gray-900">{sitting.get_percent_correct}%</strong>
          </p>
          
          <div className="inline-flex space-x-4">
            <Link href={`/courses/${resolvedParams.slug}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-colors">
              Return to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Quiz is active - show current question
  const { question, progress } = quizState;
  const answered = progress[0];
  const total = progress[1];
  const progressPercent = ((answered) / total) * 100;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
          <span>Question {answered + 1} of {total}</span>
          <span>{Math.round(progressPercent)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
            {question.content}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {question.choices.map((c: any) => (
              <label 
                key={c.id} 
                className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedAnswer === c.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={c.id}
                  checked={selectedAnswer === c.id}
                  onChange={() => setSelectedAnswer(c.id)}
                  className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className={`ml-4 text-lg ${selectedAnswer === c.id ? 'text-blue-900 font-semibold' : 'text-gray-700'}`}>
                  {c.choice}
                </span>
              </label>
            ))}

            <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={!selectedAnswer || submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-10 rounded-xl shadow-sm transition-colors text-lg"
              >
                {submitting ? 'Submitting...' : 'Next Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
