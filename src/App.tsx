import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Dashboard } from './pages/Dashboard';
import { NewClassUpdate } from './pages/NewClassUpdate';
import { ClassHistory } from './pages/ClassHistory';
import { Reports } from './pages/Reports';
import { AdminManagement } from './pages/AdminManagement';
import { Login } from './pages/Login';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes (Instructors & Admins) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new-class" element={<NewClassUpdate />} />
                <Route path="/class-update" element={<NewClassUpdate />} /> {/* Query string alias support */}
                <Route path="/history" element={<ClassHistory />} />
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin" element={<AdminManagement />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
