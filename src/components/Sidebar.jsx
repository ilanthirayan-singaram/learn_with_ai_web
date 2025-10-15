import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || user?.roles?.[0]?.name;

  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <nav className="flex flex-col gap-2">
        {role === 'admin' && <>
          <Link to="/admin" className="px-3 py-2 rounded hover:bg-slate-700">Dashboard</Link>
          <Link to="/admin/teachers" className="px-3 py-2 rounded hover:bg-slate-700">Teachers</Link>
          <Link to="/admin/students" className="px-3 py-2 rounded hover:bg-slate-700">Students</Link>
        </>}
        {role === 'teacher' && <>
          <Link to="/teacher" className="px-3 py-2 rounded hover:bg-slate-700">Dashboard</Link>
          <Link to="/teacher/lessons" className="px-3 py-2 rounded hover:bg-slate-700">Lessons</Link>
        </>}
      </nav>
    </aside>
  );
}
