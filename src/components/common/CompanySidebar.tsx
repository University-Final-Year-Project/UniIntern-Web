import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Briefcase, label: 'My Listings', path: '/listings' },
  { icon: Users, label: 'Candidates', path: '/candidates' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

const CompanySidebar = ({ collapsed, onToggle }: Props) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const profile = user?.companyProfile;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}>

      {/* Logo + Toggle */}
      <div className="px-3 py-5 border-b border-gray-100 flex items-center justify-between">
        {!collapsed ? (
          <>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <span className="text-navy font-bold text-base">UniIntern</span>
            </Link>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-navy transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white text-xs font-bold">U</span>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-navy transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : ''}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-navy text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-navy'
              }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className={`px-3 py-4 border-t border-gray-100 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {profile?.companyName?.charAt(0) ?? 'C'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {profile?.companyName?.charAt(0) ?? 'C'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-navy truncate">
                {profile?.companyName ?? 'Company'}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Recruiter
              </p>
            </div>
            <button
              onClick={logout}
              className="text-gray-300 hover:text-red-500 transition-colors"
              title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default CompanySidebar;