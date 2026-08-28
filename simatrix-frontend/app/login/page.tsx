'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import { loginUser } from './actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ipAddress, setIpAddress] = useState<string>('Loading...');

  // Mock fetching IP for the UI detail
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('192.168.1.1')); // fallback
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    
    const result = await loginUser(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  // Generate random floating blocks (Simatrix themed)
  const backgroundBlocks = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    width: Math.random() * 60 + 20,
    height: Math.random() * 60 + 20,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.15 + 0.05,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* Animated Background Patterned Floating Blocks (Blue/Indigo Theme) */}
      {backgroundBlocks.map(block => (
        <motion.div 
          key={block.id}
          className="absolute bg-indigo-500 rounded-xl shadow-lg"
          initial={{ y: 0, x: 0, rotate: 0 }}
          animate={{ 
            y: [0, -40, 0], 
            x: [0, 30, 0],
            rotate: [0, 45, 0]
          }}
          transition={{ 
            duration: block.duration, 
            repeat: Infinity, 
            ease: "linear",
            delay: block.delay 
          }}
          style={{
            width: block.width,
            height: block.height,
            top: block.top,
            left: block.left,
            opacity: block.opacity,
            backdropFilter: 'blur(8px)'
          }}
        />
      ))}

      <div className="relative z-10 flex w-full max-w-7xl mx-auto items-center">
        
        {/* Left side: Logo & Lottie Animation */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 h-full">
          {/* Simatrix Logo Lockup on the left side */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mb-10"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-4">Simatrix LMS</h1>
            <p className="text-slate-500 font-medium">Learning Management System</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-lg"
          >
            <DotLottiePlayer
              src="/Login.lottie"
              autoplay
              loop
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        </div>

        {/* Right side: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 h-full">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mx-auto w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
          >
            
            <div className="mb-10 text-center flex flex-col items-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-500">Sign in to your portal to continue.</p>
            </div>

            <form action={handleSubmit} className="space-y-6">
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3 shadow-sm mb-4">
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-rose-700 font-medium leading-relaxed">{error}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm text-slate-900 transition-all bg-slate-50/50 hover:bg-slate-50"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full rounded-xl border border-slate-200 px-4 py-3 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm text-slate-900 transition-all bg-slate-50/50 hover:bg-slate-50 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600 cursor-pointer">
                    Remember Me
                  </label>
                </div>
                <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 py-3.5 px-4 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
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

            <div className="mt-10 text-center space-y-1 pt-6 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500">Secure Environment</p>
              <p className="text-xs font-semibold text-slate-400">
                IP Address Recorded: <span className="text-indigo-400">{ipAddress}</span>
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
