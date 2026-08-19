import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <AdminSidebar />
      <div className="ml-56 pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;