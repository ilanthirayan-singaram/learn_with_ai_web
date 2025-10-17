import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherList from './pages/admin/TeacherList';
import StudentList from './pages/admin/StudentList';
import AdminLessonList from './pages/admin/LessonList';
import TeacherLessonList from './pages/teacher/LessonList';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout><AdminDashboard /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/teachers" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout><TeacherList /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/students" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout><StudentList /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <MainLayout><TeacherDashboard /></MainLayout>
          </ProtectedRoute>
        } />
        <Route
          path="/admin/lessons"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MainLayout><AdminLessonList /></MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/lessons"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <MainLayout><TeacherLessonList /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div className="p-6">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
