import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CompanyNavbar from './CompanyNavbar';
import CompanySidebar from './CompanySidebar';

const CompanyLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyNavbar sidebarCollapsed={collapsed} />
      <CompanySidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div
        className={`transition-all duration-300 pt-16 ${
          collapsed ? 'ml-16' : 'ml-56'
        }`}>
        <Outlet />
      </div>
    </div>
  );
};

export default CompanyLayout;