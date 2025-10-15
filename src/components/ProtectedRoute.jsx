import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  const role = user?.role || user?.roles?.[0]?.name;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
