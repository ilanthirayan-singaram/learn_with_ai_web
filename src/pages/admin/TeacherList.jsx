import { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function TeacherList() {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async ()=> {
      try {
        const resp = await apiFetch('/admin/users?role=teacher', {}, token);
        setTeachers(resp.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Unable to load teachers');
      }
    })();
  }, [token]);

  return (
    <div>
      <h2 className="text-xl font-semibold">Teachers</h2>
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
            {teachers.map(t=>(
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.id}</td>
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
