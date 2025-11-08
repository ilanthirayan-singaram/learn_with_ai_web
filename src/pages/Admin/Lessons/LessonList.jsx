import React, { useEffect, useState, useCallback } from 'react';
import { adminGetLessons, adminDeleteLesson } from '../../../api/lessonApi';
import LessonDetailModal from './LessonDetailModal';

export default function LessonList() {
  const [lessons, setLessons] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetLessons({ page, perPage: 15, q, status });
      // adapt to your API response shape
      const data = res.data || res;
      setLessons(data.data || data);
      setMeta(res.meta || res);
    } catch (err) {
      console.error(err);
      alert('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [page, q, status]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this lesson?')) return;
    await adminDeleteLesson(id);
    fetchLessons();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Lessons</h2>
        <div className="flex gap-2">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search" className="p-2 border rounded" />
          <select value={status} onChange={(e)=>{setStatus(e.target.value); setPage(1);}} className="p-2 border rounded">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>fetchLessons()}>Refresh</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead><tr className="bg-gray-50"><th>Title</th><th>Teacher</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5}>Loading...</td></tr> :
            lessons.length === 0 ? <tr><td colSpan={5}>No lessons</td></tr> :
            lessons.map(l => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2">{l.title}</td>
                <td className="px-3 py-2">{l.teacher?.name || l.uploaded_by}</td>
                <td className="px-3 py-2">{new Date(l.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{l.status}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={() => setSelected(l.id)} className="px-2 py-1 border rounded">View</button>
                  <button onClick={() => handleDelete(l.id)} className="px-2 py-1 border rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>Total: {meta.total || (lessons.length)}</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-2 py-1 border rounded">Prev</button>
          <div className="px-3 py-1 border rounded">{meta.current_page || page}/{meta.last_page || 1}</div>
          <button disabled={page >= (meta.last_page || 1)} onClick={() => setPage(p => p+1)} className="px-2 py-1 border rounded">Next</button>
        </div>
      </div>

      {selected && <LessonDetailModal lessonId={selected} onClose={() => { setSelected(null); fetchLessons(); }} />}
    </div>
  );
}
