// src/pages/teacher/TeacherDashboard.jsx
import React, { useState } from 'react';
import LessonUploader from '../../components/LessonUploader';
import { useAuth } from '../../context/AuthContext'; // optional

export default function TeacherDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  // get token however your app does:
  const { token: teacherToken } = useAuth() || { token: localStorage.getItem('teacher_token') };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
        >
          Add Lesson
        </button>
      </div>

      {/* ... existing dashboard content ... */}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowAddModal(false)}
          />

          {/* modal panel */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add Lesson</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <LessonUploader
                apiBaseUrl="https://learning.kvsoftsolutions.com"
                token={teacherToken}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
