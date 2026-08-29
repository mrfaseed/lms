'use client';

import { useState } from 'react';
import { Upload, FileText, Video, Trash2, Loader2, PlayCircle, FileDown } from 'lucide-react';
import { uploadFile, uploadVideo, deleteUpload } from './actions';

export default function MaterialsDashboard({ course, slug }: { course: any, slug: string }) {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadingFile(true);
    const formData = new FormData(e.currentTarget);
    try {
      await uploadFile(slug, formData);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleVideoUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadingVideo(true);
    const formData = new FormData(e.currentTarget);
    try {
      await uploadVideo(slug, formData);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDelete = async (id: number, type: 'file' | 'video') => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    setLoading(true);
    try {
      await deleteUpload(slug, id, type);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Upload Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Document Upload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upload Document</h2>
              <p className="text-sm text-slate-500">PDF, DOCX, PPTX</p>
            </div>
          </div>
          
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Document Title</label>
              <input type="text" name="title" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="e.g. Chapter 1 Notes" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">File</label>
              <input type="file" name="file" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
            </div>
            <button disabled={uploadingFile} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Document
            </button>
          </form>
        </div>

        {/* Video Upload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upload Video</h2>
              <p className="text-sm text-slate-500">MP4, MKV, AVI</p>
            </div>
          </div>
          
          <form onSubmit={handleVideoUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Video Title</label>
              <input type="text" name="title" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200" placeholder="e.g. Lecture 1 Recording" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Video File</label>
              <input type="file" name="video" accept="video/*" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-rose-500" />
            </div>
            <button disabled={uploadingVideo} type="submit" className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Video
            </button>
          </form>
        </div>

      </div>

      {/* Materials List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Course Materials</h2>
        </div>
        
        {course.uploads.length === 0 && course.videos.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No materials uploaded yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {course.videos.map((vid: any) => (
              <li key={`v-${vid.id}`} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{vid.title}</h3>
                    <p className="text-sm text-slate-500">Video Lesson</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(vid.id, 'video')} disabled={loading} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
            {course.uploads.map((doc: any) => (
              <li key={`d-${doc.id}`} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{doc.title}</h3>
                    <p className="text-sm text-slate-500">Document</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(doc.id, 'file')} disabled={loading} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
