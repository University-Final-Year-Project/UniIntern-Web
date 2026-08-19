import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Briefcase,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';

interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  pendingVerifications: number;
  pendingStudents: number;
  pendingCompanies: number;
}

interface RecentStudent {
  id: string;
  email: string;
  createdAt: string;
  studentProfile: {
    firstName: string;
    lastName: string;
    university: string | null;
    courseOfStudy: string | null;
    verificationStatus: string;
  } | null;
}

interface RecentCompany {
  id: string;
  email: string;
  createdAt: string;
  companyProfile: {
    companyName: string;
    industry: string | null;
    verificationStatus: string;
  } | null;
}

const statusBadge = (status: string) => {
  if (status === 'VERIFIED') return 'bg-teal text-white';
  if (status === 'PENDING') return 'bg-amber-400 text-white';
  return 'bg-red-500 text-white';
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<RecentStudent[]>([]);
  const [companies, setCompanies] = useState<RecentCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, studentsRes, companiesRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/students'),
          api.get('/admin/companies'),
        ]);
        setStats(statsRes.data.data);
        setStudents(studentsRes.data.data?.slice(0, 3) ?? []);
        setCompanies(companiesRes.data.data?.slice(0, 3) ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleVerifyStudent = async (userId: string) => {
    try {
      await api.patch(`/admin/students/${userId}/verify`, { status: 'VERIFIED' });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === userId
            ? { ...s, studentProfile: { ...s.studentProfile!, verificationStatus: 'VERIFIED' } }
            : s,
        ),
      );
    } catch { alert('Failed to verify student.'); }
  };

  const handleVerifyCompany = async (userId: string) => {
    try {
      await api.patch(`/admin/companies/${userId}/verify`, { status: 'VERIFIED' });
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === userId
            ? { ...c, companyProfile: { ...c.companyProfile!, verificationStatus: 'VERIFIED' } }
            : c,
        ),
      );
    } catch { alert('Failed to verify company.'); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-navy font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-1">Admin Dashboard</h1>
        <p className="text-sm text-gray-400">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-navy rounded-2xl p-5 col-span-1">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wide">
              Total Students
            </p>
            <Users className="w-5 h-5 text-white/50" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {stats?.totalStudents.toLocaleString() ?? 0}
          </p>
        </div>

        {[
          { label: 'Total Companies', value: stats?.totalCompanies ?? 0, icon: Building2 },
          { label: 'Active Jobs', value: stats?.totalJobs ?? 0, icon: Briefcase },
          { label: 'Total Applications', value: stats?.totalApplications ?? 0, icon: ClipboardList },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </p>
                <Icon className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-3xl font-bold text-navy">
                {stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}

        <div className="bg-amber-400 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
              Pending Verifications
            </p>
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-bold text-white mb-3">
            {stats?.pendingVerifications ?? 0}
          </p>
          <button
            onClick={() => navigate('/students')}
            className="bg-white text-amber-500 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
            Review Queue
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Students */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-navy">Recent Students</h2>
            <button
              onClick={() => navigate('/students')}
              className="text-xs font-semibold text-teal hover:underline">
              VIEW ALL STUDENTS
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'University / Course', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const p = s.studentProfile;
                  const status = p?.verificationStatus ?? 'PENDING';
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {p?.firstName?.charAt(0) ?? 'S'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy">
                              {p?.firstName} {p?.lastName}
                            </p>
                            <p className="text-[10px] text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-xs text-gray-600">{p?.university ?? '—'}</p>
                        <p className="text-[10px] text-gray-400">{p?.courseOfStudy ?? '—'}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(status)}`}>
                            {status}
                          </span>
                          {status === 'PENDING' && (
                            <button
                              onClick={() => handleVerifyStudent(s.id)}
                              className="text-[10px] font-bold text-teal hover:underline">
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">
                      No students yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Companies */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-navy">Recent Companies</h2>
            <button
              onClick={() => navigate('/companies')}
              className="text-xs font-semibold text-teal hover:underline">
              VIEW ALL COMPANIES
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Company', 'Industry', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => {
                  const p = c.companyProfile;
                  const status = p?.verificationStatus ?? 'PENDING';
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {p?.companyName?.charAt(0) ?? 'C'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy">
                              {p?.companyName ?? 'Company'}
                            </p>
                            <p className="text-[10px] text-gray-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-xs text-gray-600">{p?.industry ?? '—'}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(status)}`}>
                            {status}
                          </span>
                          {status === 'PENDING' && (
                            <button
                              onClick={() => handleVerifyCompany(c.id)}
                              className="text-[10px] font-bold text-teal hover:underline">
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">
                      No companies yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;