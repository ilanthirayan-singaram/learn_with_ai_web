import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import path from 'path'; // for filename extraction (works in webpack/vite)

function humanFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) return bytes + ' B';
  const units = ['KB','MB','GB','TB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

function fileNameFromUrl(urlOrPath) {
  if (!urlOrPath) return '';
  try {
    // strip query string
    const clean = urlOrPath.split('?')[0];
    return decodeURIComponent(clean.split('/').pop());
  } catch (e) {
    return urlOrPath;
  }
}

function IconForType({ type }) {
  switch (type) {
    case 'image': return <span className="text-2xl">🖼️</span>;
    case 'video': return <span className="text-2xl">🎬</span>;
    case 'audio': return <span className="text-2xl">🎧</span>;
    case 'document': return <span className="text-2xl">📄</span>;
    default: return <span className="text-2xl">📁</span>;
  }
}

/**
 * Props:
 *  - lessonId (optional) : fetches lesson /api/lessons/{id}
 *  - contents (optional) : array of lesson_contents objects (if you already fetched)
 *  - apiBaseUrl (optional) : base API URL (default from env or same origin)
 */
export default function LessonContentList({ lessonId, contents: initialContents, apiBaseUrl }) {
  const { token } = useAuth() || {};
  const [contents, setContents] = useState(initialContents || []);
  const [loading, setLoading] = useState(Boolean(lessonId && !initialContents));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lessonId || initialContents) return;
    setLoading(true);
    setError(null);

    const base = apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '';
    const url = base ? `${base}/api/lessons/${lessonId}` : `/api/lessons/${lessonId}`;

    axios.get(url, {
      headers: {
        Authorization: `Bearer ${token || localStorage.getItem('teacher_token') || ''}`,
        Accept: 'application/json',
      }
    })
    .then(resp => {
      // backend returns the lesson object inside resp.data.data (or resp.data)
      const lesson = resp.data?.data || resp.data;
      if (lesson && lesson.contents) {
        setContents(lesson.contents);
      } else if (lesson && lesson.contents === undefined && lesson.lesson_contents) {
        setContents(lesson.lesson_contents);
      } else {
        setContents([]);
      }
    })
    .catch(err => {
      console.error('Failed fetch lesson contents', err);
      setError(err?.response?.data?.message || err.message || 'Failed to fetch');
    })
    .finally(() => setLoading(false));
  }, [lessonId, initialContents, apiBaseUrl, token]);

  if (loading) return <div>Loading contents…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!contents || contents.length === 0) return <div className="text-gray-600">No files attached.</div>;

  return (
    <div className="space-y-4">
      {contents.map((c) => {
        // `c` shape based on your migration: { id, lesson_id, type, file_path, mime_type, file_size, meta, created_at, url }
        // url might already be present (controller appended), otherwise build from file_path
        const url = c.url || (c.file_path ? `${apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''}/uploads/${c.file_path}` : null);
        const filename = fileNameFromUrl(url || c.file_path);
        const size = c.file_size ? humanFileSize(c.file_size) : '';

        return (
          <div key={c.id} className="border rounded p-3 flex gap-3 items-start">
            <div className="flex-shrink-0">
              <IconForType type={c.type} />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{filename}</div>
                  <div className="text-sm text-gray-500">{c.type} • {size}</div>
                </div>

                <div className="flex items-center gap-2">
                  {url && (
                    <>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Open
                      </a>
                      <a href={url} download={filename} className="text-sm px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100">Download</a>
                    </>
                  )}
                </div>
              </div>

              {/* inline previews */}
              <div className="mt-3">
                {c.type === 'image' && url && (
                  <img src={url} alt={filename} className="max-w-full max-h-56 object-contain rounded" />
                )}

                {c.type === 'audio' && url && (
                  <audio controls className="w-full">
                    <source src={url} type={c.mime_type || 'audio/mpeg'} />
                    Your browser does not support the audio element.
                  </audio>
                )}

                {c.type === 'video' && url && (
                  <video controls className="w-full max-h-64">
                    <source src={url} type={c.mime_type || 'video/mp4'} />
                    Your browser does not support video playback.
                  </video>
                )}

                {(c.type === 'document' && url) && (
                  // small preview using iframe for pdf; docx will download/open in browser
                  c.mime_type === 'application/pdf' ? (
                    <iframe src={url} title={filename} className="w-full h-72 border" />
                  ) : (
                    <div className="text-sm text-gray-600 mt-2">Document — click <a href={url} className="text-blue-600">Open</a> to view or download.</div>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
