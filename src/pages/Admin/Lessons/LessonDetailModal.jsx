import React, { useEffect, useState } from 'react';
import { adminGetLesson, adminApproveLesson, adminRejectLesson } from '../../../api/lessonApi';

export default function LessonDetailModal({ lessonId, onClose }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    adminGetLesson(lessonId).then(res => {
      const data = res.data || res;
      setLesson(data);
    }).catch(err => {
      console.error(err);
      alert('Failed to load lesson');
    }).finally(() => setLoading(false));
  }, [lessonId]);

  const doApprove = async () => {
    if (!confirm('Approve this lesson?')) return;
    setActionLoading(true);
    try {
      await adminApproveLesson(lessonId);
      alert('Approved');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Approve failed');
    } finally { setActionLoading(false); }
  };

  const doReject = async () => {
    if (!confirm('Reject this lesson?')) return;
    setActionLoading(true);
    try {
      await adminRejectLesson(lessonId, { reason });
      alert('Rejected');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Reject failed');
    } finally { setActionLoading(false); }
  };

  if (!lessonId) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-3xl bg-white rounded shadow p-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{lesson?.title || 'Lesson'}</h3>
            <div className="text-sm text-gray-600">By: {lesson?.teacher?.name}</div>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="mt-3">
          {lesson?.video_url ? (
            <video controls src={lesson.video_url} style={{ width: '100%', maxHeight: 360 }} />
          ) : null}
          <p className="mt-2 whitespace-pre-wrap">{lesson?.description}</p>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
          <button disabled={actionLoading} onClick={doApprove} className="px-4 py-2 bg-green-600 text-white rounded">Approve</button>

          <div className="flex-1">
            <textarea placeholder="Optional rejection reason" value={reason} onChange={(e)=>setReason(e.target.value)} className="w-full p-2 border rounded" />
          </div>

          <button disabled={actionLoading} onClick={doReject} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
        </div>
      </div>
    </div>
  );
}
