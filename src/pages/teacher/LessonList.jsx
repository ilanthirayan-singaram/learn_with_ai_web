import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";

export default function TeacherLessonList() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [message, setMessage] = useState("");

  async function loadLessons() {
    try {
      const resp = await apiFetch("/teacher/lessons", {}, token);
      const list = resp.data?.data?.lessons || resp.data?.data || resp;
      setLessons(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load lessons");
    }
  }

  useEffect(() => {
    loadLessons();
  }, [token]);

  async function handleAddLesson(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const resp = await apiFetch("/teacher/lessons", {
        method: "POST",
        body: JSON.stringify(form),
      }, token);

      if (resp.status === "success") {
        setMessage("Lesson added successfully!");
        setShowAdd(false);
        setForm({ title: "", description: "" });
        loadLessons();
      } else {
        setError(resp.message || "Failed to add lesson");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error creating lesson");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Lessons</h2>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-3 py-2 rounded">
          + Add Lesson
        </button>
      </div>

      {message && <div className="text-green-600">{message}</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="p-2">{l.id}</td>
                <td className="p-2">{l.title}</td>
                <td className="p-2">{l.description || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Add Lesson</h3>
            <form onSubmit={handleAddLesson} className="space-y-3">
              <div>
                <label className="block text-sm">Title</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAdd(false)} className="border px-3 py-1 rounded">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
