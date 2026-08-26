"use client";

import React, { useState } from 'react';

export default function CourseTabs({ course }: { course: any }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'documents' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
              {course.uploads?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
              activeTab === 'videos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Video Lectures
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'videos' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
              {course.videos?.length || 0}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
              activeTab === 'quizzes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Quizzes
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'quizzes' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
              {course.quizzes?.length || 0}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('assignments')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
              activeTab === 'assignments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assignments
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'assignments' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
              3
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8 min-h-[400px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-gray-100">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {course.credit} Credits
              </div>
              <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Year {course.year} &bull; {course.semester} Semester
              </div>
              {course.is_elective && (
                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  Elective
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
              <p>{course.summary || 'No detailed description has been provided for this course yet.'}</p>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-colors">
                Enroll in Course
              </button>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Course Materials</h2>
            
            {!course.uploads || course.uploads.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                No documents have been uploaded for this course yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.uploads.map((doc: any) => (
                  <div key={doc.id} className="group border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex items-start bg-white">
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mr-4 group-hover:bg-red-100 transition-colors">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">{doc.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Uploaded: {new Date(doc.upload_time).toLocaleDateString()}</p>
                    </div>
                    <a href={`http://127.0.0.1:8000${doc.file}`} download target="_blank" rel="noreferrer" className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Video Lectures</h2>
            
            {!course.videos || course.videos.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                No video lectures are available for this course yet.
              </div>
            ) : (
              <div className="space-y-6">
                {course.videos.map((video: any) => (
                  <div key={video.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-gray-900 relative aspect-video md:aspect-auto flex items-center justify-center group cursor-pointer">
                      {/* Fake Thumbnail - In a real app we'd have a poster image */}
                      <svg className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">Video</div>
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{video.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">{video.summary || "No description provided."}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          {new Date(video.timestamp).toLocaleDateString()}
                        </span>
                        <a href={`http://127.0.0.1:8000${video.video}`} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:text-blue-700 text-sm flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Watch Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Assessments & Quizzes</h2>
            
            {!course.quizzes || course.quizzes.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                No quizzes have been assigned to this course yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.quizzes.map((quiz: any) => (
                  <div key={quiz.id} className="group border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-50 text-purple-600 p-3 rounded-lg group-hover:bg-purple-100 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Quiz</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
                    <p className="text-sm text-gray-500 mb-6 flex-grow">{quiz.description}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-400">
                        Pass Mark: {quiz.pass_mark}%
                      </span>
                      <a href={`/courses/${course.slug}/quiz/${quiz.slug}`} className="text-blue-600 font-bold hover:text-blue-700 text-sm flex items-center bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                        Take Quiz
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Coding Assignments</h2>
            
            <div className="space-y-4">
              {/* Mock Assignment 1 */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex items-center bg-white justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">Reverse String</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Easy</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Completed</span>
                  </div>
                  <p className="text-sm text-slate-500">Write a function that reverses a string in-place.</p>
                </div>
                <a href="/workspace?assignment=reverse-string" className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-100 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Open IDE
                </a>
              </div>

              {/* Mock Assignment 2 */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex items-center bg-white justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">Two Sum</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">Medium</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">In Progress</span>
                  </div>
                  <p className="text-sm text-slate-500">Find two numbers in an array that add up to a specific target.</p>
                </div>
                <a href="/workspace?assignment=two-sum" className="flex items-center px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Open IDE
                </a>
              </div>

              {/* Mock Assignment 3 */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex items-center bg-white justify-between opacity-75">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">LRU Cache</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700">Hard</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">Not Started</span>
                  </div>
                  <p className="text-sm text-slate-500">Design and implement a data structure for Least Recently Used (LRU) cache.</p>
                </div>
                <a href="/workspace?assignment=lru-cache" className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Open IDE
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
