import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import StudentLayout from './components/common/StudentLayout';

// Auth pages
import WelcomePage from './pages/auth/WelcomePage';
import ChooseRolePage from './pages/auth/ChooseRolePage';
import StudentLoginPage from './pages/auth/StudentLoginPage';
import StudentRegisterPage from './pages/auth/StudentRegisterPage';
import CompanyLoginPage from './pages/auth/CompanyLoginPage';
import CompanyRegisterPage from './pages/auth/CompanyRegisterPage';

// Student pages
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentFeedPage from './pages/student/StudentFeedPage';
import JobDetailPage from './pages/student/JobDetailPage';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import EditProfilePage from './pages/student/EditProfilePage';
import UploadDocumentsPage from './pages/student/UploadDocumentsPage';
import CompanyPublicProfilePage from './pages/student/CompanyPublicProfilePage';
import ApplyJobPage from './pages/student/ApplyJobPage';

// Company pages
import CompanyJobsPage from './pages/company/CompanyJobsPage';
import PostJobPage from './pages/company/PostJobPage';
import EditJobPage from './pages/company/EditJobPage';
import ReviewApplicantsPage from './pages/company/ReviewApplicantsPage';
import CompanyProfilePage from './pages/company/CompanyProfilePage';
import CompanyLayout from './components/common/CompanyLayout';
import CompanyDashboardPage from './pages/company/CompanyDashboardPage';

// Admin pages
import AdminLayout from './components/common/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-navy text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      {!user && (
        <>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/choose-role" element={<ChooseRolePage />} />
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/student/register" element={<StudentRegisterPage />} />
          <Route path="/company/login" element={<CompanyLoginPage />} />
          <Route path="/company/register" element={<CompanyRegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}

      {user?.role === 'STUDENT' && (
        <Route element={<StudentLayout />}>
          <Route path="/" element={<StudentDashboardPage />} />
          <Route path="/feed" element={<StudentFeedPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/jobs/:jobId/apply" element={<ApplyJobPage />} />
          <Route path="/applications" element={<StudentApplicationsPage />} />
          <Route path="/profile" element={<StudentProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/documents" element={<UploadDocumentsPage />} />
          <Route path="/company/:companyId" element={<CompanyPublicProfilePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}

      {/* Company routes */}
      {user?.role === 'COMPANY' && (
        <Route element={<CompanyLayout />}>
          <Route path="/" element={<CompanyDashboardPage />} />
          <Route path="/listings" element={<CompanyJobsPage />} />
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/jobs/:jobId/edit" element={<EditJobPage />} />
          <Route path="/candidates" element={<ReviewApplicantsPage />} />
          <Route path="/jobs/:jobId/applicants" element={<ReviewApplicantsPage />} />
          <Route path="/settings" element={<CompanyProfilePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}

      {/* Admin routes */}
      {user?.role === 'ADMIN' && (
        <Route element={<AdminLayout />}>
          <Route path="/" element={<AdminDashboardPage />} />
          <Route path="/students" element={<AdminStudentsPage />} />
          <Route path="/companies" element={<AdminCompaniesPage />} />
          <Route path="/jobs" element={<AdminJobsPage />} />
          <Route path="/applications" element={<AdminApplicationsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;