import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/apiClient';
import { API_V1 } from '../../api/config';

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-2">{value ?? '—'}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token, user, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!token) return;
    let mounted = true;
    (async () => {
      try {
        const data = await apiFetch('/user-counts', {}, token);
        if (mounted) setStats(data.data || data);
      } catch (err) {
        console.error('Fetch stats error:', err);
        setError(err.message || 'Unable to load stats');
      }
    })();
    return ()=> mounted = false;
  }, [token, loading]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="text-sm">Welcome, {user?.name}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <StatCard title="Teachers" value={stats?.teachers} />
        <StatCard title="Students" value={stats?.students} />
        <StatCard title="Lessons" value={stats?.lesson_count} />
      </div>
    </div>
  );
}
