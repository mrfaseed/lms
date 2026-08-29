'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import { loginUser } from './actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent double submission
  async function handleSubmit(formData: FormData) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await loginUser(formData);
      
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }

  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 20 + 20,
        delay: Math.random() * 10,
      }))
    );
  }, []);

  return (
    <div 
      className="relative flex min-h-screen w-full overflow-hidden selection:bg-indigo-500/30"
      style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #EEF5FF 100%)' }}
    >
      
      {/* GLOBAL ATMOSPHERE LAYER (Full Screen) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Left: Soft blurred blue blob */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-blue-400/20 rounded-full blur-[140px] mix-blend-multiply" />
        
        {/* Center: Subtle purple glow */}
        <div className="absolute top-[20%] left-[35%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[120px] mix-blend-multiply" />
        
        {/* Right: Tiny blue glow behind login card */}
        <div className="absolute top-[30%] right-[5%] w-[30%] h-[50%] bg-indigo-500/15 rounded-full blur-[120px] mix-blend-multiply" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-20" />

        {/* Animated Particles Everywhere */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute bg-indigo-500/20 rounded-full pointer-events-none"
            style={{ width: p.size, height: p.size, top: p.top, left: p.left }}
            animate={{ 
              y: [0, -100, 0], 
              opacity: [0.1, 0.6, 0.1] 
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-[1400px] mx-auto">
        
        {/* LEFT SIDE: Lottie & Branding */}
        <div className="hidden lg:flex w-[55%] relative flex-col items-center justify-center p-12">
          
          {/* Glass Container Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-12 left-12 z-20"
          >
            <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Simatrix</h1>
                <p className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">Learning Platform</p>
              </div>
            </div>
          </motion.div>

          {/* Central Illustration (Lottie) without the harsh spotlight */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className="relative w-full max-w-lg z-10"
          >
            {/* Very faint localized glow just to lift the illustration off the grid */}
            <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full pointer-events-none" />
            <DotLottiePlayer
              src="/Login.lottie"
              autoplay
              loop
              style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }}
            />
          </motion.div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 relative z-20">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md mx-auto"
          >
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
                Welcome back
              </h2>
              <p className="text-base text-slate-500">Enter your credentials to access your portal.</p>
            </div>

            <form action={handleSubmit} className="space-y-5 relative">

              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl bg-rose-50/80 p-4 border border-rose-100 flex items-start gap-3 mb-2">
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-rose-800 font-medium leading-relaxed">{error}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2 group">
                <div className="relative transition-all duration-300">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="peer block w-full rounded-2xl border border-slate-200 px-5 py-4 placeholder-transparent focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 sm:text-base text-slate-900 transition-all bg-white hover:bg-slate-50/50 shadow-sm focus:shadow-md focus:shadow-indigo-500/5"
                    placeholder="Enter username"
                  />
                  <label 
                    htmlFor="username" 
                    className="absolute left-5 -top-2.5 bg-white px-1 text-xs font-medium text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600 pointer-events-none"
                  >
                    Username or Email
                  </label>
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="relative transition-all duration-300">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="peer block w-full rounded-2xl border border-slate-200 px-5 py-4 placeholder-transparent focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 sm:text-base text-slate-900 transition-all bg-white hover:bg-slate-50/50 shadow-sm focus:shadow-md focus:shadow-indigo-500/5 pr-12"
                    placeholder="Password"
                  />
                  <label 
                    htmlFor="password" 
                    className="absolute left-5 -top-2.5 bg-white px-1 text-xs font-medium text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600 pointer-events-none"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <div className="relative flex items-center justify-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md focus:ring-4 focus:ring-indigo-500/20 focus:outline-none checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer hover:border-indigo-400"
                    />
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors hover:underline underline-offset-4">
                  Forgot Password?
                </a>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-2xl bg-indigo-600 py-4 px-4 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_8px_20px_rgb(79,70,229,0.25)] hover:shadow-[0_8px_25px_rgb(79,70,229,0.35)] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-12 flex items-center justify-center gap-2 text-slate-400">
               <ShieldCheck className="w-4 h-4" /> 
              <span className="text-xs font-medium tracking-wide uppercase">Managed by Simatrix IT Team</span>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
