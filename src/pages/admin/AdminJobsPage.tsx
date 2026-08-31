import { useEffect, useState } from 'react';
import { Briefcase, Users } from 'lucide-react';
import api from '../../services/api';

interface Job {
  id: string;
  title: string;
  location: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
  company: {
    companyProfile: {
      companyName: string;
    } | null;
  };
  _count: { applications: number };
}

type FilterType = 'ALL' | 'ACTIVE' | 'INACTIVE';

const ITEMS_PER_PAGE = 10;

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    FULL_TIME: 'bg-blue-50 text-blue-600',
    PART_TIME: 'bg-purple-50 text-purple-600',
    REMOTE: 'bg-teal-light text-teal-dark',
    HYBRID: 'bg-amber-50 text-amber-600',
  };
  return map[type] ?? 'bg-gray-100 text-gray-500';
};

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/jobs')
      .then((res) => setJobs(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (jobId: string, isActive: boolean) => {
    try {
      setUpdatingId(jobId);
      await api.patch(`/admin/jobs/${jobId}/status`, { isActive: !isActive });
      setJobs((prev) =>
        prev.map((j) => j.id === jobId ? { ...j, isActive: !isActive } : j),
      );
    } catch { alert('Failed to update job status.'); }
    finally { setUpdatingId(null); }
  };

  const filtered = jobs.filter((j) => {
    if (filter === 'ACTIVE') return j.isActive;
    if (filter === 'INACTIVE') return !j.isActive;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalApplicants = jobs.reduce((sum, j) => sum + j._count.applications, 0);
  const activeCount = jobs.filter((j) => j.isActive).length;
  const inactiveCount = jobs.filter((j) => !j.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-1">Job Management</h1>
          <p className="text-sm text-gray-400">Monitor all internship listings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Total Active Jobs
            </p>
            <Briefcase className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-3xl font-bold text-navy">{activeCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Total Applicants
            </p>
            <Users className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-3xl font-bold text-navy">{totalApplicants.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 border-b border-gray-200 w-full pb-0">
          {([
            { key: 'ALL', label: 'All Listings' },
            { key: 'ACTIVE', label: 'Active' },
            { key: 'INACTIVE', label: `Inactive ${inactiveCount > 0 ? inactiveCount : ''}` },
          ] as { key: FilterType; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                filter === f.key
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-400 hover:text-navy'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100">
            <tr>
              {['Job Title', 'Company Name', 'Location', 'Type', 'Applicants', 'Status', 'Posted Date', 'Actions'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-400">
                  Loading jobs...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-400">
                  No jobs found.
                </td>
              </tr>
            ) : (
              paginated.map((job) => (
                <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-navy">{job.title}</p>
                    <p className="text-[10px] text-gray-400">
                      ID: #{job.id.substring(0, 8).toUpperCase()}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">
                          {job.company.companyProfile?.companyName?.charAt(0) ?? 'C'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {job.company.companyProfile?.companyName ?? 'Company'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-gray-500">{job.location ?? 'Remote'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${typeBadge(job.type)}`}>
                      {job.type.replace('_', '-')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-navy">{job._count.applications}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${job.isActive ? 'bg-teal' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-500">
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggle(job.id, job.isActive)}
                      disabled={updatingId === job.id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        job.isActive
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-teal hover:bg-teal-light'
                      }`}>
                      {updatingId === job.id ? '...' : job.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)} to{' '}
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-navy hover:text-navy disabled:opacity-30 transition-colors text-sm">
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                    page === p
                      ? 'bg-navy text-white'
                      : 'border border-gray-200 text-gray-500 hover:border-navy hover:text-navy'
                  }`}>
                  {p}
                </button>
              ))}
              {totalPages > 5 && (
                <>
                  <span className="text-gray-400 text-xs">...</span>
                  <button
                    onClick={() => setPage(totalPages)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-navy hover:text-navy transition-colors">
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-navy hover:text-navy disabled:opacity-30 transition-colors text-sm">
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsPage;