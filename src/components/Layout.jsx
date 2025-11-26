import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Settings, BarChart3, FileText } from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">StudySearch</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.fullName || user?.firstName || user?.email || 'User'}</span>
              </span>
              {isAdmin() && (
                <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                  Admin
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {!isAdmin() ? (
              <>
                <NavLink
                  to="/"
                  icon={<FileText className="h-5 w-5" />}
                  label="Documents"
                  active={location.pathname === '/'}
                />
                <NavLink
                  to="/settings"
                  icon={<Settings className="h-5 w-5" />}
                  label="Settings"
                  active={location.pathname === '/settings'}
                />
                <NavLink
                  to="/evaluation"
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Evaluation"
                  active={location.pathname === '/evaluation'}
                />
              </>
            ) : (
              <>
                <NavLink
                  to="/admin"
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Dashboard"
                  active={location.pathname === '/admin' || location.pathname === '/'}
                />
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

const NavLink = ({ to, icon, label, active }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-primary-50 text-primary-700 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default Layout;

