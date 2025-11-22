// src/pages/teacher/CreateLesson.jsx
import React from 'react';
import LessonUploader from '../../components/LessonUploader';
import { useAuth } from '../../context/AuthContext';

export default function CreateLesson() {
  const { teacherToken } = useAuth();   // If your AuthContext exposes teacherToken
  // If not, fallback: const teacherToken = localStorage.getItem('teacher_token');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Lesson</h1>

      <LessonUploader 
        apiBaseUrl="https://learning.kvsoftsolutions.com" 
        token={teacherToken}
      />
    </div>
  );
}
