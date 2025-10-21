import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";

export default function TeacherLessonList() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: 10, total: 0 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", file: null });
  const [loading, setLoading] = useState(false);

  // Fetch lessons (with pagination)
  async function loadLessons(page = 1) {
    try {
      setLoading(true);
      const resp = await apiFetch(`/teacher/lessons?page=${page}`, {}, token);
      const data = resp.data || {};
      setLessons(data.data || []);
      setMeta({
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLessons(1);
  }, [token]);

  // Handle lesson upload
  async function handleAddLesson(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    if (form.file) formData.append("file", form.file);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/teacher/lessons`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        setMessage("Lesson added successfully!");
        setShowAdd(false);
        setForm({ title: "", description: "", file: null });
        loadLessons(meta.current_page);
      } else {
        setError(data.message || "Failed to add lesson");
      }
    } catch (err) {
      console.error(err);
      setError("Error adding lesson");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Lessons</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          + Add Lesson
        </button>
      </div>

      {message && <div className="text-green-600 mb-2">{message}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading && <div className="text-gray-500 mb-2">Loading...</div>}

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">File</th>
              <th className="p-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No lessons found.
                </td>
              </tr>
            )}
            {lessons.map((l, index) => (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  {(index + 1) +
                    ((meta.current_page - 1) * meta.per_page || 0)}
                </td>
                <td className="p-2 font-medium">{l.title}</td>
                <td className="p-2">{l.description || "—"}</td>
                <td className="p-2">
                  {l.file_path ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL.replace(
                        "/api",
                        ""
                      )}/storage/${l.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2">
                  {l.created_at
                    ? new Date(l.created_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-3 text-sm">
        <div>
          Page {meta.current_page} of{" "}
          {Math.ceil(meta.total / meta.per_page) || 1}
        </div>
        <div className="flex gap-2">
          <button
            disabled={meta.current_page <= 1}
            onClick={() => loadLessons(meta.current_page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={
              meta.current_page >= Math.ceil(meta.total / meta.per_page)
            }
            onClick={() => loadLessons(meta.current_page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Lesson Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Lesson</h3>
            <form onSubmit={handleAddLesson} className="space-y-3">
              <div>
                <label className="block text-sm">Title</label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm">Upload File</label>
                <input
                  type="file"
                  accept="image/*,.pdf,video/*,audio/*"
                  onChange={(e) =>
                    setForm({ ...form, file: e.target.files[0] })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3 py-1 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
