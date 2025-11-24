console.log('TeacherDashboard (src/pages/teacher) loaded —', new Date().toISOString());
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from "../../context/AuthContext";
import LessonPreview from '../../components/LessonPreview'; // adjust path
// TeacherDashboard.jsx
// Single-file React component (Tailwind CSS assumed available)
// Default export a component that shows: lesson list, create/edit modal, file uploads with progress, publish toggle
// const API_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "";

export default function TeacherDashboard() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', subject: '' });
  const [files, setFiles] = useState({ image: null, document: null, audio: null, video: null });
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/lessons`,{
        
        headers: {
          Authorization: `Bearer ${token}`,
        },
       
      });




      const data = await res.json();
      if (data.status === 'success') setLessons(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', description: '', subject: '' });
    setFiles({ image: null, document: null, audio: null, video: null });
    setProgress(0);
    setShowModal(true);
  }

  function openEdit(lesson) {
    setEditing(lesson);
    setForm({ title: lesson.title || '', description: lesson.description || '', subject: lesson.subject || '' });
    setFiles({ image: null, document: null, audio: null, video: null });
    setProgress(0);
    setShowModal(true);
  }

  function onFileChange(e, key) {
    const file = e.target.files[0];
    setFiles(prev => ({ ...prev, [key]: file }));
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function uploadLesson(e) {
    e.preventDefault();
    const url = editing ? `/api/teacher/lessons/${editing.id}` : '/api/teacher/lessons';
    const method = editing ? 'POST' : 'POST'; // backend will decide between create/update based on route

    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('subject', form.subject);

    ['image', 'document', 'audio', 'video'].forEach(k => {
      if (files[k]) fd.append(k, files[k]);
    });

    // If editing, add _method=PUT so Laravel treats it as update (when using POST with _method)
    if (editing) fd.append('_method', 'PUT');

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setProgress(pct);
      }
    };

    xhr.onload = async function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        setShowModal(false);
        setProgress(0);
        fetchLessons();
      } else {
        console.error('Upload failed', xhr.responseText);
        alert('Upload failed: ' + xhr.status);
      }
    };

    xhr.onerror = function () {
      alert('Network error during upload');
    };

    xhr.open('POST', url);
    // Attach auth header if using token (example): xhr.setRequestHeader('Authorization', 'Bearer ' + token)
    xhr.send(fd);
  }

  async function togglePublish(lesson) {
    try {
      const res = await fetch(`/api/teacher/lessons/${lesson.id}/toggle-publish`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') fetchLessons();
    } catch (e) {
      console.error(e);
    }
  }

  async function handlePreview(lessonId) {
    setPreviewLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${API_BASE}/api/teacher/lessons/${lessonId}/preview`, {
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const json = await res.json();
      if (json.status === 'success') {
        setPreviewLesson(json.data);
      } else {
        alert(json.message || 'Preview failed');
      }
    } catch (e) {
      console.error('preview error', e);
      alert('Preview failed: ' + e.message);
    } finally {
      setPreviewLoading(false);
    }
  }
  


  async function removeLesson(lesson) {
    if (!confirm('Delete this lesson?')) return;
    try {
      const res = await fetch(`/api/teacher/lessons/${lesson.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') fetchLessons();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
        <div>
          <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded">New Lesson</button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map(lesson => (
            <div key={lesson.id} className="p-4 border rounded shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">{lesson.title}</h2>
                  <p className="text-sm text-gray-600">{lesson.subject}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm">{lesson.created_at}</div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-700">{lesson.description}</p>

              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => handlePreview(lesson.id)} className="px-2 py-1 border rounded text-sm">Preview</button>
                <button onClick={() => openEdit(lesson)} className="px-2 py-1 border rounded text-sm">Edit</button>
                <button onClick={() => togglePublish(lesson)} className="px-2 py-1 border rounded text-sm">{lesson.is_published ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => removeLesson(lesson)} className="px-2 py-1 border rounded text-sm text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={uploadLesson} className="bg-white w-full max-w-2xl p-6 rounded shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl">{editing ? 'Edit Lesson' : 'Create Lesson'}</h3>
              <button type="button" onClick={() => setShowModal(false)}>Close</button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Title" className="border p-2 rounded" />
              <input name="subject" value={form.subject} onChange={handleChange} required placeholder="Subject" className="border p-2 rounded" />
              <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Description" className="border p-2 rounded h-24" />

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col">
                  Image
                  <input ref={el => (fileInputRef.current = el)} type="file" accept="image/*" onChange={(e) => onFileChange(e, 'image')} />
                </label>
                <label className="flex flex-col">
                  Document
                  <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => onFileChange(e, 'document')} />
                </label>
                <label className="flex flex-col">
                  Audio
                  <input type="file" accept="audio/*" onChange={(e) => onFileChange(e, 'audio')} />
                </label>
                <label className="flex flex-col">
                  Video
                  <input type="file" accept="video/*" onChange={(e) => onFileChange(e, 'video')} />
                </label>
              </div>

              {progress > 0 && (
                <div>
                  <div className="text-sm mb-1">Upload progress: {progress}%</div>
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div style={{ width: `${progress}%` }} className="h-2 rounded bg-indigo-600" />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </form>
        </div>
      )}
      {previewLesson && (
  <LessonPreview lesson={previewLesson} onClose={() => setPreviewLesson(null)} />
)}
{previewLoading && <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow">Loading preview...</div>}

    </div>
  );
}

/*
  ---------------------------
  Laravel: Suggested routes (api.php)
  ---------------------------

  Route::middleware(['auth:sanctum','role:teacher'])->prefix('teacher')->group(function() {
      Route::get('/lessons', [TeacherLessonController::class, 'index']);
      Route::post('/lessons', [TeacherLessonController::class, 'store']);
      Route::put('/lessons/{lesson}', [TeacherLessonController::class, 'update']);
      Route::delete('/lessons/{lesson}', [TeacherLessonController::class, 'destroy']);
      Route::post('/lessons/{lesson}/toggle-publish', [TeacherLessonController::class, 'togglePublish']);
  });

  ---------------------------
  Laravel: Controller snippets
  ---------------------------

  // TeacherLessonController.php (methods)

  public function index(Request $request) {
      $user = $request->user();
      $lessons = Lesson::where('created_by', $user->id)->orderBy('created_at', 'desc')->get();
      return response()->json(['status' => 'success', 'data' => $lessons]);
  }

  public function store(Request $request) {
      $request->validate([
          'title' => 'required|string|max:255',
          'description' => 'required|string',
          'subject' => 'required|string|max:100',
          'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
          'document' => 'nullable|mimes:pdf,doc,docx,txt|max:5120',
          'audio' => 'nullable|mimes:mp3,wav,ogg|max:10240',
          'video' => 'nullable|mimes:mp4,mov,avi|max:51200',
      ]);

      $lesson = Lesson::create([
          'created_by' => $request->user()->id,
          'title' => $request->title,
          'description' => $request->description,
          'subject' => $request->subject,
      ]);

      foreach (['image','document','audio','video'] as $fileType) {
          if ($request->hasFile($fileType)) {
              $path = $request->file($fileType)->store("lessons/{$lesson->id}/{$fileType}", 'public');
              $lesson->{$fileType . '_path'} = $path;
          }
      }

      $lesson->save();

      return response()->json(['status' => 'success', 'data' => $lesson]);
  }

  public function update(Request $request, Lesson $lesson) {
      $this->authorize('update', $lesson);

      $request->validate([
          'title' => 'required|string|max:255',
          'description' => 'required|string',
          'subject' => 'required|string|max:100',
          'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
          'document' => 'nullable|mimes:pdf,doc,docx,txt|max:5120',
          'audio' => 'nullable|mimes:mp3,wav,ogg|max:10240',
          'video' => 'nullable|mimes:mp4,mov,avi|max:51200',
      ]);

      $lesson->update($request->only(['title','description','subject']));

      foreach (['image','document','audio','video'] as $fileType) {
          if ($request->hasFile($fileType)) {
              // delete old file if exists
              if ($lesson->{$fileType . '_path'}) Storage::disk('public')->delete($lesson->{$fileType . '_path'});
              $path = $request->file($fileType)->store("lessons/{$lesson->id}/{$fileType}", 'public');
              $lesson->{$fileType . '_path'} = $path;
          }
      }

      $lesson->save();
      return response()->json(['status' => 'success', 'data' => $lesson]);
  }

  public function destroy(Request $request, Lesson $lesson) {
      $this->authorize('delete', $lesson);
      // delete files
      foreach (['image','document','audio','video'] as $fileType) {
          if ($lesson->{$fileType . '_path'}) Storage::disk('public')->delete($lesson->{$fileType . '_path'});
      }
      $lesson->delete();
      return response()->json(['status' => 'success']);
  }

  public function togglePublish(Request $request, Lesson $lesson) {
      $this->authorize('update', $lesson);
      $lesson->is_published = !$lesson->is_published;
      $lesson->save();
      return response()->json(['status' => 'success', 'data' => $lesson]);
  }

  ---------------------------
  Migration: lessons table (columns)
  ---------------------------

  Schema::create('lessons', function (Blueprint $table) {
      $table->id();
      $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
      $table->string('title');
      $table->string('subject')->nullable();
      $table->text('description')->nullable();
      $table->string('image_path')->nullable();
      $table->string('document_path')->nullable();
      $table->string('audio_path')->nullable();
      $table->string('video_path')->nullable();
      $table->boolean('is_published')->default(false);
      $table->timestamps();
  });

  ---------------------------
  Extra Enhancements Ideas (quick)
  ---------------------------
  - Video thumbnail extraction job (use ffmpeg in a queued job)
  - Background video transcoding (generate web-friendly mp4 + HLS)
  - Preview mode: short preview clips or read-only view for students
  - Bulk upload CSV for metadata + zip for files
  - Lesson analytics: views, completions (increment on student APIs)
  - Role-based access: ensure only teachers can CRUD their lessons
  - Notifications: broadcast when teacher publishes a lesson

  ---------------------------
  Notes
  ---------------------------
  - Authentication: this component expects auth handled (Sanctum or token header)
  - CSRF: when using session auth in browser, ensure CSRF token is included
  - File size limits: adjust php.ini and nginx config for big file uploads
*/
