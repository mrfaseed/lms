'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO
} from 'date-fns';

export default function CalendarView({ events }: { events: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  // Build the calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      // Find events for this day
      const dayEvents = events.filter(e => {
        if (!e.date) return false;
        const eDate = parseISO(e.date);
        return isSameDay(eDate, cloneDay);
      });

      days.push(
        <motion.div 
          variants={itemVariants}
          key={day.toString()} 
          className={`min-h-[120px] p-2 border border-slate-100 transition-colors ${
            !isSameMonth(day, monthStart) 
              ? "bg-slate-50 text-slate-400" 
              : isSameDay(day, new Date()) 
                ? "bg-indigo-50/30 text-indigo-700 font-bold" 
                : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <div className="flex justify-end">
            <span className={`w-8 h-8 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white shadow-sm' : ''}`}>
              {formattedDate}
            </span>
          </div>
          
          <div className="mt-2 flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-hide">
            {dayEvents.map(e => (
              <div 
                key={e.id} 
                className={`text-xs p-1.5 rounded truncate shadow-sm font-medium ${
                  e.type === 'Event' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
                title={e.title}
              >
                {e.title}
              </div>
            ))}
          </div>
        </motion.div>
      );
      day = addDays(day, 1);
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">University Calendar</h1>
          <p className="text-slate-600 font-medium">Keep track of important events and announcements.</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-40 text-center font-bold text-slate-800 text-lg">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <button onClick={goToToday} className="px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            Today
          </button>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </motion.div>
      
      {/* Legend */}
      <motion.div variants={itemVariants} className="flex items-center space-x-6 text-sm font-medium text-slate-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-purple-400 mr-2"></div>
          Events
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-blue-400 mr-2"></div>
          News
        </div>
      </motion.div>

    </motion.div>
  );
}
