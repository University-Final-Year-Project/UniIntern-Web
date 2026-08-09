import { useAuth } from '../../context/AuthContext';

const CompanyNavbar = ({ sidebarCollapsed }: { sidebarCollapsed?: boolean }) => {
  const { user } = useAuth();
  const profile = user?.companyProfile;

  return (
    <nav
      className="fixed top-0 right-0 z-50 bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6"
      style={{
        left: sidebarCollapsed !== undefined ? (sidebarCollapsed ? '4rem' : '14rem') : 0,
        transition: 'left 0.3s',
      }}>

      {/* Mini logo */}
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-navy text-xs font-bold">UI</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-navy transition-colors">
          <span className="text-xl">🔔</span>
        </button>
        <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-navy">
              {profile?.companyName ?? 'Company'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {profile?.companyName?.charAt(0) ?? 'C'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CompanyNavbar;