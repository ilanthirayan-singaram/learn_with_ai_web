// src/pages/Admin/Lessons/LessonDetailModal.jsx
import React, { useEffect, useState } from "react";
import { getLesson, approveLesson, rejectLesson } from "../../../api/lessonApi";

export default function LessonDetailModal({ lessonId, onClose, onActionComplete }) {
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    getLesson(lessonId)
      .then((res) => setLesson(res.data || res))
      .catch((err) => {
        console.error("Could not fetch lesson", err);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (!lessonId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="p-4 border-b flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{lesson?.title || "Lesson details"}</h2>
            <p className="text-sm text-gray-500">By {lesson?.teacher?.name || lesson?.uploaded_by}</p>
          </div>
          <button className="text-gray-600" onClick={onClose}>✕</button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {lesson?.video_url ? (
                <div>
                  <video controls style={{ width: "100%", maxHeight: 420 }} src={lesson.video_url} />
                </div>
              ) : lesson?.attachment_url ? (
                <div>
                  <a href={lesson.attachment_url} target="_blank" rel="noreferrer" className="underline">Open attachment</a>
                </div>
              ) : null}

              <div>
                <h3 className="font-medium">Description</h3>
                <p className="whitespace-pre-wrap mt-1 text-sm text-gray-700">{lesson?.description || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-medium">Status</div>
                  <div className="mt-1">{lesson?.status}</div>
                </div>
                <div>
                  <div className="font-medium">Uploaded at</div>
                  <div className="mt-1">{lesson?.created_at ? new Date(lesson.created_at).toLocaleString() : "-"}</div>
                </div>
                <div>
                  <div className="font-medium">Subject / Class</div>
                  <div className="mt-1">{lesson?.subject || lesson?.class || "-"}</div>
                </div>
                <div>
                  <div className="font-medium">Teacher Email</div>
                  <div className="mt-1">{lesson?.teacher?.email || lesson?.uploaded_by_email || "-"}</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-2">
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                  disabled={actionLoading || lesson?.status === "approved"}
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      await approveLesson(lessonId);
                      onActionComplete && onActionComplete();
                    } catch (e) {
                      console.error(e);
                      alert("Approve failed");
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                >
                  {actionLoading ? "Working..." : "Approve"}
                </button>

                <div className="flex-1">
                  <textarea
                    placeholder="Optional rejection reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none"
                    rows={2}
                  />
                </div>

                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  disabled={actionLoading || lesson?.status === "rejected"}
                  onClick={async () => {
                    if (!window.confirm("Reject this lesson?")) return;
                    setActionLoading(true);
                    try {
                      await rejectLesson(lessonId, { reason: rejectionReason });
                      onActionComplete && onActionComplete();
                    } catch (e) {
                      console.error(e);
                      alert("Reject failed");
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                >
                  {actionLoading ? "Working..." : "Reject"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
