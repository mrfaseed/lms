'use client';

import React, { useState } from 'react';
import { Settings, Shield, Bell, Globe, Database, Save, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form states (mocked for now)
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [currentSemester, setCurrentSemester] = useState('First');
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const tabs = [
    { id: 'general', label: 'General & Academic', icon: Globe },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System & Database', icon: Database },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" /> Platform Settings
          </h2>
          <p className="text-slate-500 mt-1">Configure academic calendars, security protocols, and system preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 font-medium"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Settings saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col gap-1 sticky top-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Academic Calendar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Current Academic Year</label>
                    <select 
                      value={academicYear}
                      onChange={e => setAcademicYear(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option>2025/2026</option>
                      <option>2026/2027</option>
                      <option>2027/2028</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Active Semester</label>
                    <select 
                      value={currentSemester}
                      onChange={e => setCurrentSemester(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option>First</option>
                      <option>Second</option>
                      <option>Third</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Platform Access</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-800">Student Registration</div>
                      <div className="text-sm text-slate-500">Allow new students to create accounts on the platform.</div>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full transition-colors ease-in-out duration-200 focus:outline-none bg-slate-200">
                      <input type="checkbox" className="peer sr-only" checked={registrationOpen} onChange={() => setRegistrationOpen(!registrationOpen)} />
                      <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${registrationOpen ? 'translate-x-6' : 'translate-x-0'}`}></span>
                      <div className={`absolute inset-0 rounded-full transition-colors ${registrationOpen ? 'bg-indigo-500' : 'bg-slate-200'}`} style={{ zIndex: -1 }}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-800">Maintenance Mode</div>
                      <div className="text-sm text-slate-500">Take the platform offline for updates. Only admins can log in.</div>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full transition-colors ease-in-out duration-200 focus:outline-none bg-slate-200">
                      <input type="checkbox" className="peer sr-only" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                      <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
                      <div className={`absolute inset-0 rounded-full transition-colors ${maintenanceMode ? 'bg-rose-500' : 'bg-slate-200'}`} style={{ zIndex: -1 }}></div>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab !== 'general' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Module Under Construction</h3>
              <p className="max-w-md">The {tabs.find(t => t.id === activeTab)?.label} settings module has not been fully ported to the new REST API yet. Check back soon!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
