import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  ClipboardList,
  LogOut,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: Building2, label: 'Companies', path: '/companies' },
  { icon: Briefcase, label: 'Jobs', path: '/jobs' },
  { icon: ClipboardList, label: 'Applications', path: '/applications' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 z-40 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <span className="text-navy font-bold text-base">UniIntern</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-navy'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3 px-2">
          <div className="w-2 h-2 rounded-full bg-teal" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Admin Role
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;