import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/apiClient';

export default function TeacherDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async ()=> {
      try {
        const resp = await apiFetch('/api/teacher/lessons', {}, token);
        const lessons = resp.data || resp || [];
        const lessonCount = Array.isArray(lessons) ? lessons.length : (lessons.lesson_count || 0);
        setStats({ lesson_count: lessonCount, student_count: lessons.student_count || 0 });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
      <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Lessons</div>
          <div className="text-2xl font-bold mt-2">{stats?.lesson_count ?? '—'}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Students</div>
          <div className="text-2xl font-bold mt-2">{stats?.student_count ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}
