import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm rounded">
      <div className="text-lg font-semibold">Learn With AI</div>
      <div className="flex items-center gap-3">
        {user && <div className="text-sm">{user.name}</div>}
        {user && <button onClick={logout} className="px-3 py-1 bg-blue-600 text-white rounded">Logout</button>}
      </div>
    </div>
  );
}
