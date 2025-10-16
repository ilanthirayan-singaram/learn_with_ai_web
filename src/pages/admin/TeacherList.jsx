import { useEffect, useState } from "react";
import { apiFetch } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function TeacherList() {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  async function loadTeachers() {
    try {
      const resp = await apiFetch("/admin/users?role=teacher", {}, token);
      const list = resp.data?.data || resp.data || [];
      setTeachers(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load teachers");
    }
  }

  useEffect(() => {
    loadTeachers();
  }, [token]);

  async function handleAddTeacher(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = { ...form, role: "teacher" }; // ✅ add the role field
      const resp = await apiFetch("/admin/users/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }, token);
      
      if (resp.status === "success") {
        setMessage("Teacher added successfully!");
        setShowAdd(false);
        setForm({ name: "", email: "", password: "" });
        loadTeachers(); // refresh list
      } else {
        setError(resp.message || "Failed to add teacher");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error adding teacher");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Teachers</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          + Add Teacher
        </button>
      </div>

      {message && <div className="text-green-600 mb-2">{message}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.id}</td>
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Teacher Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Teacher</h3>
            <form onSubmit={handleAddTeacher} className="space-y-3">
              <div>
                <label className="block text-sm">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  type="email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Password</label>
                <input
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  type="password"
                  required
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
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
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
