import React from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <NavBar />
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
