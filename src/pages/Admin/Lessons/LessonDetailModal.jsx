// src/pages/Admin/Lessons/LessonDetailModal.jsx
import React, { useEffect, useState } from 'react';
import { adminGetLesson, adminApproveLesson, adminRejectLesson } from '../../../api/lessonApi';

export default function LessonDetailModal({ lessonId, onClose, onActionComplete }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    adminGetLesson(lessonId)
      .then((res) => {
        // backend shapes vary: support multiple shapes
        // possible forms: res.data (object), res.data.data (object), res (object)
        console.log('adminGetLesson response raw ->', res);
        const payload = (res && res.data) ? (res.data.data || res.data) : res;
        console.log('resolved lesson payload ->', payload);
        setLesson(payload);
      })
      .catch((err) => {
        console.error('Failed to fetch lesson ->', err);
        alert('Failed to load lesson details. See console for details.');
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  // helper to normalize status strings for comparison
  const normalizedStatus = (s) => (typeof s === 'string' ? s.toLowerCase().trim() : String(s));

  const isApproved = lesson && ['approved', 'published', '1', 'true'].includes(normalizedStatus(lesson.status));
  const isRejected = lesson && ['rejected', '0', 'false'].includes(normalizedStatus(lesson.status));

  const doApprove = async () => {
    if (!confirm('Approve this lesson?')) return;
    setActionLoading(true);
    try {
      console.log('Approving lesson id', lessonId);
      const res = await adminApproveLesson(lessonId);
      console.log('approve response ->', res);
      alert('Lesson approved');
      onActionComplete && onActionComplete();
      onClose && onClose();
    } catch (e) {
      console.error('Approve failed ->', e);
      alert('Approve failed. See console.');
    } finally {
      setActionLoading(false);
    }
  };

  const doReject = async () => {
    if (!confirm('Reject this lesson?')) return;
    setActionLoading(true);
    try {
      console.log('Rejecting lesson id', lessonId, 'reason', reason);
      const res = await adminRejectLesson(lessonId, { reason });
      console.log('reject response ->', res);
      alert('Lesson rejected');
      onActionComplete && onActionComplete();
      onClose && onClose();
    } catch (e) {
      console.error('Reject failed ->', e);
      alert('Reject failed. See console.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!lessonId) return null;

  return (
    <div data-lesson-modal className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="p-4 border-b flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{lesson?.title || 'Lesson details'}</h2>
            <p className="text-sm text-gray-500">By {lesson?.teacher?.name || lesson?.uploaded_by || '-'}</p>
          </div>
          <button className="text-gray-600" onClick={onClose} aria-label="close">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {/* Video preview (if available) */}
              {lesson?.video_url ? (
                <div>
                  <video controls style={{ width: '100%', maxHeight: 420 }} src={lesson.video_url} />
                </div>
              ) : lesson?.attachment_url ? (
                <div>
                  <a href={lesson.attachment_url} target="_blank" rel="noreferrer" className="underline">Open attachment</a>
                </div>
              ) : (
                <div className="text-sm text-gray-600">No video/attachment available.</div>
              )}

              <div>
                <h3 className="font-medium">Description</h3>
                <p className="whitespace-pre-wrap mt-1 text-sm text-gray-700">{lesson?.description || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-medium">Status</div>
                  <div className="mt-1">{lesson?.status ?? '-'}</div>
                </div>
                <div>
                  <div className="font-medium">Uploaded at</div>
                  <div className="mt-1">{lesson?.created_at ? new Date(lesson.created_at).toLocaleString() : '-'}</div>
                </div>
              </div>

              {/* Reason box for rejection */}
              <div>
                <textarea
                  placeholder="Optional rejection reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                  rows={3}
                />
              </div>

              {/* Action buttons — ALWAYS render them (disabled when not applicable) */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-2">
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                  disabled={actionLoading || isApproved}
                  onClick={doApprove}
                  data-testid="approve-btn"
                >
                  {actionLoading ? 'Working...' : isApproved ? 'Already approved' : 'Approve'}
                </button>

                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  disabled={actionLoading || isRejected}
                  onClick={doReject}
                  data-testid="reject-btn"
                >
                  {actionLoading ? 'Working...' : isRejected ? 'Already rejected' : 'Reject'}
                </button>

                <div className="flex-1 text-right text-sm text-gray-500">
                  {lesson?.approved_by ? `Approved by ${lesson.approved_by} at ${lesson.approved_at}` : ''}
                  {lesson?.rejected_by ? `Rejected by ${lesson.rejected_by} at ${lesson.rejected_at}` : ''}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
