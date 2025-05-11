import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Book as Books, History, MessageSquare, Home, LogOut, Menu, X, Heart } from 'lucide-react';

interface UserLayoutProps {
  children: React.ReactNode;
  title: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children, title }) => {
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
        className={`fixed lg:static inset-y-0 left-0 z-10 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-xl font-display font-bold text-primary-800">Library System</h2>
          </div>

          <div className="p-4 border-b border-gray-200">
            <Link to="/user/profile" className="flex flex-col items-center cursor-pointer hover:bg-primary-50 rounded-lg p-2 transition">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-2xl font-bold mb-2">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <p className="text-lg font-semibold">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <NavLink
              to="/user/dashboard"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <Home size={20} className="mr-3" />
              Dashboard
            </NavLink>
            <NavLink
              to="/user/borrowed"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <BookOpen size={20} className="mr-3" />
              My Borrowed Books
            </NavLink>
            <NavLink
              to="/user/history"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <History size={20} className="mr-3" />
              Borrowing History
            </NavLink>
            <NavLink
              to="/user/browse"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <Books size={20} className="mr-3" />
              Browse Books
            </NavLink>
            <NavLink
              to="/user/favorites"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <Heart size={20} className="mr-3" />
              Favorites
            </NavLink>
            <NavLink
              to="/user/messages"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <MessageSquare size={20} className="mr-3" />
              Messages
            </NavLink>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
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

export default UserLayout;