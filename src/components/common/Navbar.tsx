import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ sidebarCollapsed }: { sidebarCollapsed?: boolean }) => {  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
<nav className="fixed top-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100"
      style={{ left: sidebarCollapsed !== undefined ? (sidebarCollapsed ? '4rem' : '14rem') : 0, transition: 'left 0.3s' }}>
      <div className="px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">U</span>
          </div>
          <span className="text-navy font-bold text-lg">UniIntern</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-gray-600 hover:text-navy transition-colors">
            Home
          </Link>
          {user?.role === 'STUDENT' && (
          <Link to="/feed" className="text-sm text-gray-600 hover:text-navy transition-colors">
            Browse Jobs
          </Link>
            )}
          {!user && (
            <a href="#about" className="text-sm text-gray-600 hover:text-navy transition-colors">
              About
            </a>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/choose-role"
                className="text-sm text-navy font-medium hover:text-navy-light transition-colors">
                Sign In
              </Link>
              <Link
                to="/choose-role"
                className="bg-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-light transition-colors">
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center overflow-hidden">
                  {(user.studentProfile as any)?.avatarUrl ? (
                    <img
                      src={(user.studentProfile as any).avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {user.studentProfile?.firstName?.charAt(0) ??
                        user.companyProfile?.companyName?.charAt(0) ??
                        'U'}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">▾</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDropdownOpen(false)}>
                    My Profile
                  </Link>
                  {user.role === 'STUDENT' && (
                    <Link
                      to="/applications"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}>
                      My Applications
                    </Link>
                  )}
                  {user.role === 'COMPANY' && (
                    <Link
                      to="/post-job"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}>
                      Post a Job
                    </Link>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50"
                    onClick={() => { setDropdownOpen(false); logout(); }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;