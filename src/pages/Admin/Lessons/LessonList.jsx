// src/pages/Admin/Lessons/LessonList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getLessons, deleteLesson } from "../../../api/lessonApi";
import LessonDetailModal from "./LessonDetailModal";

export default function LessonList() {
  const [lessons, setLessons] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLessons({ page, perPage, q, status: statusFilter });
      // adapt to what your API returns (some return res.data.data)
      const payload = res.data || res; // prefer res.data
      const data = payload.data || payload;
      const metaObj = payload.meta || payload;
      setLessons(Array.isArray(data) ? data : data.data || []);
      setMeta({
        current_page: metaObj.current_page || metaObj.currentPage || 1,
        last_page: metaObj.last_page || metaObj.lastPage || 1,
        total: metaObj.total || metaObj.total || (Array.isArray(data) ? data.length : 0),
      });
    } catch (err) {
      console.error("Failed to fetch lessons", err);
      alert("Unable to load lessons");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, q, statusFilter, refreshToggle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete lesson permanently?")) return;
    try {
      setLoading(true);
      await deleteLesson(id);
      setRefreshToggle((t) => t + 1);
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const onActionComplete = () => {
    // refresh list and close modal
    setRefreshToggle((t) => t + 1);
    setSelectedLessonId(null);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Lessons</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search title or teacher..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="p-2 border rounded"
            onKeyDown={(e) => { if (e.key === "Enter") setPage(1); }}
          />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="p-2 border rounded">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setPage(1); setRefreshToggle((t) => t + 1); }}>
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-2 text-sm">Title</th>
              <th className="px-4 py-2 text-sm">Teacher</th>
              <th className="px-4 py-2 text-sm">Uploaded</th>
              <th className="px-4 py-2 text-sm">Status</th>
              <th className="px-4 py-2 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center">Loading...</td></tr>
            ) : lessons.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center">No lessons found</td></tr>
            ) : (
              lessons.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{l.title}</td>
                  <td className="px-4 py-3 text-sm">{l.teacher?.name || l.uploaded_by || "-"}</td>
                  <td className="px-4 py-3 text-sm">{l.created_at ? new Date(l.created_at).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${l.status === "approved" ? "bg-green-100 text-green-700" : l.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => setSelectedLessonId(l.id)}>View</button>
                    {l.status !== "approved" && <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async () => {
                      if (!window.confirm("Approve this lesson?")) return;
                      try {
                        setLoading(true);
                        await fetch(`/api/admin/lessons/${l.id}/approve`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` } });
                        setRefreshToggle((t) => t + 1);
                      } catch (e) {
                        console.error(e);
                        alert("Approve failed");
                      } finally {
                        setLoading(false);
                      }
                    }}>Approve</button>}
                    {l.status !== "rejected" && <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={async () => {
                      if (!window.confirm("Reject this lesson?")) return;
                      try {
                        setLoading(true);
                        await fetch(`/api/admin/lessons/${l.id}/reject`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}`, "Content-Type": "application/json" }, body: JSON.stringify({ reason: "Rejected by admin" }) });
                        setRefreshToggle((t) => t + 1);
                      } catch (e) {
                        console.error(e);
                        alert("Reject failed");
                      } finally {
                        setLoading(false);
                      }
                    }}>Reject</button>}
                    <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => handleDelete(l.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {meta.total}</div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <div className="px-3 py-1 border rounded">{meta.current_page}/{meta.last_page}</div>
          <button className="px-2 py-1 border rounded" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>

      {selectedLessonId && (
        <LessonDetailModal
          lessonId={selectedLessonId}
          onClose={() => setSelectedLessonId(null)}
          onActionComplete={onActionComplete}
        />
      )}
    </div>
  );
}
