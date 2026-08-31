import { Bell } from 'lucide-react';

const AdminNavbar = () => {
  return (
    <nav
      className="fixed top-0 right-0 z-50 bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6"
      style={{ left: '14rem' }}>
      <div className="flex items-center justify-center">
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-navy transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-navy">Administrator</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              UniIntern Portal
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;