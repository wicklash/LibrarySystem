import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Library, MessageSquare, Home, LogOut, Menu, X, Users } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-10 w-64 bg-primary-950 text-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-primary-800">
            <h2 className="text-xl font-display font-bold">Admin Panel</h2>
          </div>

          <div className="p-4 border-b border-primary-800">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary-700 flex items-center justify-center text-white text-2xl font-bold mb-2">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <p className="text-lg font-semibold">{user?.username}</p>
              <p className="text-sm text-primary-300">{user?.email}</p>
              <span className="mt-1 px-2 py-1 text-xs rounded-full bg-primary-700">
                Administrator
              </span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-800'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <Home size={20} className="mr-3" />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/books"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-800'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <Library size={20} className="mr-3" />
              Manage Books
            </NavLink>
            <NavLink
              to="/admin/borrows"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-800'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <BookOpen size={20} className="mr-3" />
              Manage Borrowing
            </NavLink>
            <NavLink
              to="/admin/messages"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-800'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <MessageSquare size={20} className="mr-3" />
              Messages
            </NavLink>
          </nav>

          <div className="p-4 border-t border-primary-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-primary-100 hover:bg-primary-800 transition-colors duration-200"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-display font-bold text-gray-900">{title}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;