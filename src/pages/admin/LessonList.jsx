import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";

export default function AdminLessonList() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiFetch("/api/v1/lessons", {}, token);
        const list = resp.data?.data || resp;
        setLessons(list);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load lessons");
      }
    })();
  }, [token]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Lessons</h2>
      {error && <div className="text-red-600">{error}</div>}
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Created By</th>
              <th className="p-2 text-left">Created On</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="p-2">{l.id}</td>
                <td className="p-2">{l.title}</td>
                <td className="p-2">{l.teacher?.name || "—"}</td>
                <td className="p-2">{new Date(l.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
