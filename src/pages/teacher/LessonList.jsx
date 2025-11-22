import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";

/**
 * TeacherLessonList
 * - Shows lessons (paginated)
 * - Displays a single primary content per lesson (image -> video -> document -> audio -> any)
 */
export default function TeacherLessonList() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: 10, total: 0 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", file: null });
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "";

  // ---------- helpers ----------
  function getPrimaryContent(lesson) {
    if (!lesson) return null;
    const contents = lesson.contents || lesson.course_contents || lesson.lesson_contents || [];
    if (!contents || contents.length === 0) return null;

    // prefer image, then video, then document, then audio, then first
    const findBy = (type) => contents.find((c) => c.type === type);
    return findBy("image") || findBy("video") || findBy("document") || findBy("audio") || contents[0];
  }

  function buildContentUrl(content) {
    if (!content) return null;
    if (content.url) return content.url;
    if (!content.file_path) return null;

    // Try using API base (strip '/api' if present) and append /uploads/{file_path}
    const base = API_BASE || "";
    if (base) {
      return `${base.replace(/\/api$/, "")}/uploads/${content.file_path}`;
    }
    // fallback to relative path
    return `/uploads/${content.file_path}`;
  }

  function humanFileSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return bytes + " B";
    const units = ["KB", "MB", "GB", "TB"];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + " " + units[u];
  }

  // ---------- data load ----------
async function loadLessons(page = 1) {
  try {
    setLoading(true);
    setError("");
    const resp = await apiFetch(`/api/teacher/lessons?page=${page}`, {}, token);
    const raw = resp && resp.data !== undefined ? resp.data : resp; // normalize wrapper
    console.log("loadLessons: raw response:", raw);

    // Determine lessons array and pagination values from common response shapes
    let lessonsArray = [];
    let cp = 1, pp = 10, total = 0;

    // 1) raw = { status:'success', data: [ ... ], current_page, per_page, total }
    if (raw && Array.isArray(raw.data)) {
      lessonsArray = raw.data;
      cp = raw.current_page ?? raw.page ?? cp;
      pp = raw.per_page ?? raw.perPage ?? pp;
      total = raw.total ?? total;
    }
    // 2) raw = { data: { data: [ ... ], current_page, per_page, total } } (double-wrapped)
    else if (raw && raw.data && Array.isArray(raw.data.data)) {
      lessonsArray = raw.data.data;
      cp = raw.data.current_page ?? raw.data.page ?? cp;
      pp = raw.data.per_page ?? raw.data.perPage ?? pp;
      total = raw.data.total ?? total;
    }
    // 3) raw is an array
    else if (Array.isArray(raw)) {
      lessonsArray = raw;
    }
    // 4) raw.items pagination shape
    else if (raw && Array.isArray(raw.items)) {
      lessonsArray = raw.items;
      cp = raw.page ?? cp;
      pp = raw.perPage ?? pp;
      total = raw.total ?? total;
    } else {
      console.warn("loadLessons: unexpected response shape", raw);
    }

    setLessons(lessonsArray);
    setMeta({
      current_page: cp,
      per_page: pp,
      total: total,
    });
  } catch (err) {
    console.error("loadLessons error", err);
    setError(err?.response?.data?.message || err.message || "Failed to load lessons");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    if (token) loadLessons(1);
  }, [token]);

  // ---------- handle add lesson ----------
  async function handleAddLesson(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description || "");
    if (form.file) {
      // backend supports file arrays; here we append a single file
      formData.append("documents[]", form.file); // using documents[] as generic - backend accepts document/audio/video/image
      // OR change to formData.append('image', form.file) depending on file type detection preference
    }

    try {
      const res = await fetch(`${API_BASE}/api/teacher/lessons`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.status === "success" || res.status === 201) {
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

  // ---------- render ----------
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Lessons</h2>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-3 py-2 rounded">
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
            {lessons.map((l, index) => {
              const content = getPrimaryContent(l);
              const url = content ? buildContentUrl(content) : (l.file_path ? `${API_BASE.replace("/api", "")}/storage/${l.file_path}` : null);
              const filename = content ? (content.url || content.file_path || "").split("/").pop() : (l.file_path || "").split("/").pop();

              return (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{(index + 1) + ((meta.current_page - 1) * meta.per_page || 0)}</td>
                  <td className="p-2 font-medium">{l.title}</td>
                  <td className="p-2">{l.description || "—"}</td>
                  <td className="p-2">
                    {url ? (
                      <div className="flex items-center gap-3">
                        {content && content.type === "image" ? (
                          <img src={url} alt={filename} className="w-20 h-12 object-cover rounded" />
                        ) : content && content.type === "video" ? (
                          <video src={url} className="w-20 h-12 object-cover rounded" muted />
                        ) : (
                          <div className="px-2 py-1 border rounded text-sm">{content ? content.type : "file"}</div>
                        )}

                        <div>
                          <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">
                            {filename || "Open file"}
                          </a>
                          {content && content.file_size ? <div className="text-xs text-gray-500">{humanFileSize(content.file_size)}</div> : null}
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-2">{l.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-3 text-sm">
        <div>
          Page {meta.current_page} of {Math.ceil(meta.total / meta.per_page) || 1}
        </div>
        <div className="flex gap-2">
          <button disabled={meta.current_page <= 1} onClick={() => loadLessons(meta.current_page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">
            Prev
          </button>
          <button
            disabled={meta.current_page >= Math.ceil(meta.total / meta.per_page)}
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
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" rows="3" />
              </div>
              <div>
                <label className="block text-sm">Upload File</label>
                <input type="file" accept="image/*,.pdf,video/*,audio/*" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1 rounded border">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">
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
