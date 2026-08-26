import React from 'react';
import CalendarView from './CalendarView';

async function getCalendarEvents() {
  const res = await fetch('http://127.0.0.1:8000/api/core/calendar/', { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch calendar events');
  }
  
  return res.json();
}

export default async function CalendarPage() {
  const events = await getCalendarEvents();
  return <CalendarView events={events} />;
}
