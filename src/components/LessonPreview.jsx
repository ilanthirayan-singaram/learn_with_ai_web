// src/components/LessonPreview.jsx
import React from 'react';

export default function LessonPreview({ lesson, onClose }) {
  if (!lesson) return null;

  const { title, subject, description, image_url, document_url, audio_url, video_url, created_at } = lesson;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="text-sm text-gray-500">{subject} · {new Date(created_at).toLocaleString()}</div>
          </div>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>

        <div className="space-y-4">
          {/* Image */}
          {image_url && (
            <div>
              <img src={image_url} alt="lesson" className="max-h-48 w-auto rounded object-cover" />
            </div>
          )}

          {/* Video (use poster if image present) */}
          {video_url && (
            <div>
              <video
                controls
                width="100%"
                poster={image_url || undefined}
                style={{ maxHeight: 480 }}
                playsInline
              >
                <source src={video_url} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Audio */}
          {audio_url && (
            <div>
              <audio controls style={{ width: '100%' }}>
                <source src={audio_url} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Document — embed PDF or fall back to download link */}
          {document_url && (
            <div>
              {/* If it's a PDF, embed in iframe. For other docs, try Google Docs viewer or just link. */}
              {document_url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={document_url}
                  style={{ width: '100%', height: 600, border: '1px solid #e5e7eb' }}
                  title="Document preview"
                />
              ) : (
                <div>
                  <a href={document_url} target="_blank" rel="noopener noreferrer" className="underline">
                    Open document
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="prose max-w-none">
            <p>{description}</p>
          </div>

          {/* Downloads */}
          <div className="flex gap-2 flex-wrap">
            {image_url && (
              <a className="px-3 py-1 border rounded text-sm" href={image_url} target="_blank" rel="noopener noreferrer">Open Image</a>
            )}
            {video_url && (
              <a className="px-3 py-1 border rounded text-sm" href={video_url} target="_blank" rel="noopener noreferrer">Open Video</a>
            )}
            {audio_url && (
              <a className="px-3 py-1 border rounded text-sm" href={audio_url} target="_blank" rel="noopener noreferrer">Open Audio</a>
            )}
            {document_url && (
              <a className="px-3 py-1 border rounded text-sm" href={document_url} target="_blank" rel="noopener noreferrer">Open Document</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
