import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserBorrowedBooks from './pages/user/UserBorrowedBooks';
import UserBookHistory from './pages/user/UserBookHistory';
import UserMessages from './pages/user/UserMessages';
import BrowseBooks from './pages/user/BrowseBooks';
import BookDetails from './pages/user/BookDetails';
import Favorites from './pages/user/Favorites';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageBorrows from './pages/admin/ManageBorrows';
import AdminMessages from './pages/admin/AdminMessages';

// Protected route wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
}> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated 
            ? <Navigate to={isAdmin ? "/admin/dashboard" : "/user/dashboard"} replace /> 
            : <Navigate to="/login" replace />
        } 
      />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />

      {/* User routes */}
      <Route path="/user/dashboard" element={
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/user/borrowed" element={
        <ProtectedRoute>
          <UserBorrowedBooks />
        </ProtectedRoute>
      } />
      <Route path="/user/history" element={
        <ProtectedRoute>
          <UserBookHistory />
        </ProtectedRoute>
      } />
      <Route path="/user/messages" element={
        <ProtectedRoute>
          <UserMessages />
        </ProtectedRoute>
      } />
      <Route path="/user/browse" element={
        <ProtectedRoute>
          <BrowseBooks />
        </ProtectedRoute>
      } />
      <Route path="/user/book/:id" element={
        <ProtectedRoute>
          <BookDetails />
        </ProtectedRoute>
      } />
      <Route path="/user/favorites" element={
        <ProtectedRoute>
          <Favorites />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/books" element={
        <ProtectedRoute requireAdmin>
          <ManageBooks />
        </ProtectedRoute>
      } />
      <Route path="/admin/borrows" element={
        <ProtectedRoute requireAdmin>
          <ManageBorrows />
        </ProtectedRoute>
      } />
      <Route path="/admin/messages" element={
        <ProtectedRoute requireAdmin>
          <AdminMessages />
        </ProtectedRoute>
      } />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;