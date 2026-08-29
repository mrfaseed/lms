'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, ShieldAlert, Maximize, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchNextQuestion, submitAnswer, terminateTest } from './actions';
import Link from 'next/link';

export default function StrictTestingEnvironment() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Anti-cheat states
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  
  // Test states
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<any>(null);
  const [progress, setProgress] = useState<[number, number]>([0, 0]); // [answered, total]
  const [isComplete, setIsComplete] = useState(false);
  const [sittingData, setSittingData] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize and fetch first question when started
  useEffect(() => {
    if (hasStarted && isFullscreen && !isComplete && !isTerminated) {
      loadNextQuestion();
    }
  }, [hasStarted, isFullscreen]);

  // Anti-cheat Listeners
  useEffect(() => {
    if (!hasStarted || isComplete || isTerminated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) triggerViolation('Switched tabs or minimized window');
    };

    const handleBlur = () => {
      triggerViolation('Clicked outside of the testing environment');
    };
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        triggerViolation('Exited fullscreen mode');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasStarted, isComplete, isTerminated]);

  const triggerViolation = (reasonText: string) => {
    setViolationCount(prev => {
      const newCount = prev + 1;
      return newCount;
    });
    setTerminationReason(prev => prev || "Repeated strict-mode violations: " + reasonText);
  };

  useEffect(() => {
    if (violationCount >= 3 && !isTerminated) {
      setIsTerminated(true);
      setShowWarning(false);
      terminateTest(slug, terminationReason || "Repeated strict-mode violations");
    } else if (violationCount > 0 && violationCount < 3) {
      setShowWarning(true);
    }
  }, [violationCount, isTerminated, slug, terminationReason]);

  const startTest = async () => {
    if (containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        setHasStarted(true);
      } catch (err) {
        alert("Fullscreen is required to take this test. Please allow fullscreen access.");
      }
    }
  };

  const loadNextQuestion = async () => {
    setLoading(true);
    const res = await fetchNextQuestion(slug);
    if (res.error) {
      // If forbidden due to termination (we send status 403 in backend but actions.ts returns error)
      if (res.error === 'Failed to fetch question' || res.terminated) {
         // wait, actions.ts just returns `error`. But we modified actions.ts to return the body!
         // Wait, the backend returns `{ terminated: True, violation_reason: ... }` with HTTP_403.
         // actions.ts does: `if (!res.ok) { const err = await res.json(); return { error: err.error || 'Failed' }; }`
      }
      alert(res.error);
    } else if (res.terminated) {
      setIsTerminated(true);
      setTerminationReason(res.violation_reason || 'Strict-mode violation detected');
    } else if (res.complete) {
      setIsComplete(true);
      setSittingData(res.sitting);
    } else {
      setQuestion(res.question);
      setProgress(res.progress);
    }
    setLoading(false);
    setSelectedAnswer(null);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;
    setLoading(true);
    
    const res = await submitAnswer(slug, selectedAnswer);
    if (res.error) {
      alert(res.error);
      setLoading(false);
    } else {
      await loadNextQuestion();
    }
  };

  // --- RENDERING SCREENS ---

  if (isTerminated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-rose-600 rounded-3xl p-12 max-w-lg text-center text-white shadow-2xl shadow-rose-900/50">
          <ShieldAlert className="w-24 h-24 mx-auto mb-6 text-rose-200" />
          <h1 className="text-4xl font-black tracking-tight mb-4">TEST TERMINATED</h1>
          <p className="text-rose-100 font-medium text-lg leading-relaxed mb-4">
            You have violated the strict testing environment rules.
          </p>
          {terminationReason && (
            <div className="bg-rose-900/30 p-4 rounded-xl mb-8 border border-rose-500">
              <span className="block text-rose-200 font-bold mb-1 text-sm uppercase tracking-wider">Reason</span>
              <span className="text-white font-medium">{terminationReason}</span>
            </div>
          )}
          <p className="text-sm text-rose-200 mb-8 font-medium">This session has been permanently locked and flagged. Please contact your lecturer.</p>
          <Link href="/" className="inline-block bg-white text-rose-900 font-bold px-8 py-3 rounded-xl hover:bg-rose-50 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-xl border border-slate-100">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Test Submitted!</h1>
          <p className="text-slate-500 font-medium mb-8">Your examination has been securely recorded.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Score</span>
              <span className="block text-2xl font-black text-slate-800">{sittingData?.get_percent_correct}%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</span>
              <span className={`block text-xl font-black ${sittingData?.check_if_passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                {sittingData?.check_if_passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>

          <Link href="/" className="block w-full bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white min-h-screen w-full flex flex-col">
      
      {/* Before Test Starts */}
      {!hasStarted && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
              <ShieldAlert className="w-8 h-8 text-slate-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Secure Assessment</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              This assessment is proctored in strict mode. You must remain in fullscreen. Navigating away, switching tabs, or exiting fullscreen 3 times will automatically terminate your session.
            </p>
            <button 
              onClick={startTest}
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Maximize className="w-4 h-4 mr-2" />
              Begin Assessment
            </button>
          </div>
        </div>
      )}

      {/* Active Testing Environment */}
      {hasStarted && (
        <div className="min-h-screen flex flex-col">
          
          {/* Header Bar */}
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3 text-slate-800">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <span className="font-bold tracking-tight">Simatrix Secure Exam</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400">Violations:</span>
                <span className={`text-sm font-black px-2 py-0.5 rounded ${violationCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {violationCount} / 3
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
                Question {progress[0] + 1} of {progress[1]}
              </div>
            </div>
          </header>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-slate-100">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
              style={{ width: `${(progress[0] / progress[1]) * 100}%` }}
            />
          </div>

          {/* Question Area */}
          <main className="flex-1 max-w-4xl w-full mx-auto p-8 flex flex-col justify-center relative">
            
            {/* Warning Overlay */}
            <AnimatePresence>
              {showWarning && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-md p-6"
                  >
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center">
                      <div className="flex items-center justify-center gap-2 mb-6 text-slate-400">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Simatrix Secure Exam</span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-slate-900 mb-3">Secure session paused</h2>
                      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                        We detected that you switched away from the secure exam window.
                      </p>

                      <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
                        <div className="flex justify-center gap-2 mb-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i <= violationCount ? 'bg-amber-500' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Violation {violationCount} of 3</span>
                        <p className="text-xs text-slate-400 font-medium">One more violation will automatically terminate this quiz.</p>
                      </div>

                      <button 
                        onClick={() => {
                          setShowWarning(false);
                          startTest(); // re-request fullscreen if lost
                        }}
                        className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Resume Exam
                      </button>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
                <span className="font-bold">Loading...</span>
              </div>
            ) : question ? (
              <div className="w-full bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 leading-relaxed mb-10">
                  {question.content}
                </h2>
                
                <div className="space-y-4">
                  {question.choices.map((choice: any) => (
                    <label 
                      key={choice.id} 
                      className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAnswer === choice.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <input 
                        type="radio" 
                        name="answer" 
                        value={choice.id} 
                        checked={selectedAnswer === choice.id}
                        onChange={() => setSelectedAnswer(choice.id)}
                        className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                      />
                      <span className={`ml-4 text-lg font-medium ${selectedAnswer === choice.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {choice.choice}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-12 flex justify-end">
                  <button 
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer || loading}
                    className="bg-indigo-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            ) : null}

          </main>
        </div>
      )}

    </div>
  );
}
