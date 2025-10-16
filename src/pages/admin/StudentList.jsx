import { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function StudentList() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiFetch('/admin/users?role=student', {}, token);
        const list = resp.data?.data || resp.data || [];
        setStudents(list);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Unable to load teachers');
      }
    })();
  }, [token]);

  return (
    <div>
      <h2 className="text-xl font-semibold">Students</h2>
      {error && <div className="text-red-600">{error}</div>}
      <div className="mt-4 bg-white rounded shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s=>(
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.id}</td>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
