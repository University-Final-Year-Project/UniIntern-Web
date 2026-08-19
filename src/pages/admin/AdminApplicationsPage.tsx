import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  student: {
    studentProfile: {
      firstName: string;
      lastName: string;
      university: string | null;
    } | null;
  };
  jobPosting: {
    title: string;
    company: {
      companyProfile: {
        companyName: string;
      } | null;
    };
  };
}

type FilterType = 'ALL' | 'PENDING' | 'SHORTLISTED' | 'INTERVIEWING' | 'ACCEPTED' | 'REJECTED';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    SHORTLISTED: 'bg-blue-100 text-blue-700',
    INTERVIEWING: 'bg-purple-100 text-purple-700',
    ACCEPTED: 'bg-teal-light text-teal-dark',
    REJECTED: 'bg-gray-100 text-gray-500',
  };
  return map[status] ?? 'bg-gray-100 text-gray-500';
};

const avatarColors = [
  'bg-blue-400', 'bg-purple-400', 'bg-teal',
  'bg-amber-400', 'bg-pink-400', 'bg-navy',
];

const ITEMS_PER_PAGE = 10;

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/admin/applications')
      .then((res) => setApplications(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = applications.filter((a) =>
    filter === 'ALL' || a.status === filter,
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: 'All Applications' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEWING', label: 'Interviewing' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy mb-1">Applications Overview</h1>
        <p className="text-sm text-gray-400">
          All internship applications across the platform
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const count = f.key === 'ALL'
              ? applications.length
              : applications.filter((a) => a.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  filter === f.key
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {f.label}
                <span className={`ml-1.5 ${filter === f.key ? 'text-white/70' : 'text-gray-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100">
            <tr>
              {[
                'Student Name',
                'Student University',
                'Job Title',
                'Company Name',
                'Date Applied',
                'Status',
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-gray-400 px-6 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  Loading applications...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  No applications found.
                </td>
              </tr>
            ) : (
              paginated.map((app, i) => {
                const student = app.student.studentProfile;
                const firstName = student?.firstName ?? 'Student';
                const lastName = student?.lastName ?? '';
                const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
                const color = avatarColors[i % avatarColors.length];

                return (
                  <tr
                    key={app.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">
                            {initials}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-navy">
                          {firstName} {lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">
                        {student?.university ?? '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-navy">
                        {app.jobPosting.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">
                        {app.jobPosting.company.companyProfile?.companyName ?? '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">
                        {new Date(app.appliedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)} to{' '}
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of{' '}
              {filtered.length} entries
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

export default AdminApplicationsPage;