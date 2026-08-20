import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../services/api';

interface Student {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  studentProfile: {
    firstName: string;
    lastName: string;
    university: string | null;
    courseOfStudy: string | null;
    verificationStatus: string;
  } | null;
}

type FilterType = 'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED';

const statusBadge = (status: string) => {
  if (status === 'VERIFIED') return 'bg-teal text-white';
  if (status === 'PENDING' || status === 'UNVERIFIED') return 'bg-amber-400 text-white';
  if (status === 'REJECTED') return 'bg-red-500 text-white';
  return 'bg-gray-200 text-gray-600';
};

const statusLabel = (status: string) => {
  if (status === 'UNVERIFIED') return 'PENDING';
  return status;
};

const isPending = (status: string) => ['PENDING', 'UNVERIFIED'].includes(status);

const ITEMS_PER_PAGE = 10;

const AdminStudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/students')
      .then((res) => setStudents(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleVerify = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setUpdatingId(userId);
      await api.patch(`/admin/students/${userId}/verify`, { status });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === userId
            ? { ...s, studentProfile: { ...s.studentProfile!, verificationStatus: status } }
            : s,
        ),
      );
    } catch {
      alert('Failed to update verification.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      setUpdatingId(userId);
      await api.patch(`/admin/users/${userId}/status`, { isActive: !isActive });
      setStudents((prev) =>
        prev.map((s) => s.id === userId ? { ...s, isActive: !isActive } : s),
      );
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      !search ||
      `${s.studentProfile?.firstName} ${s.studentProfile?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentProfile?.university?.toLowerCase().includes(search.toLowerCase());

    const status = s.studentProfile?.verificationStatus ?? '';
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'PENDING' && isPending(status)) ||
      (filter === 'VERIFIED' && status === 'VERIFIED') ||
      (filter === 'REJECTED' && status === 'REJECTED');

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const filterCounts = {
    ALL: students.length,
    VERIFIED: students.filter((s) => s.studentProfile?.verificationStatus === 'VERIFIED').length,
    PENDING: students.filter((s) => isPending(s.studentProfile?.verificationStatus ?? '')).length,
    REJECTED: students.filter((s) => s.studentProfile?.verificationStatus === 'REJECTED').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy mb-1">Student Management</h1>
        <p className="text-sm text-gray-400">
          Manage all registered students and their verification status.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email or university..."
              className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {(['ALL', 'VERIFIED', 'PENDING', 'REJECTED'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                filter === f
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {f === 'ALL' ? 'ALL STUDENTS' : f}
              <span className={`text-[10px] ${filter === f ? 'text-white/70' : 'text-gray-400'}`}>
                ({filterCounts[f]})
              </span>
              {f === 'PENDING' && filterCounts.PENDING > 0 && (
                <span className="bg-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-0.5">
                  !
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100">
            <tr>
              {['Student Details', 'Academic Info', 'Status', 'Joined Date', 'Actions'].map((h) => (
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
                <td colSpan={5} className="text-center py-16 text-gray-400">
                  Loading students...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400">
                  No students found.
                </td>
              </tr>
            ) : (
              paginated.map((s) => {
                const p = s.studentProfile;
                const status = p?.verificationStatus ?? 'UNVERIFIED';
                const initials = `${p?.firstName?.charAt(0) ?? ''}${p?.lastName?.charAt(0) ?? ''}`;

                return (
                  <tr
                    key={s.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy">
                            {p?.firstName} {p?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600">{p?.university ?? '—'}</p>
                      <p className="text-[10px] text-gray-400">{p?.courseOfStudy ?? '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(status)}`}>
                        {statusLabel(status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">
                        {new Date(s.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isPending(status) && (
                          <>
                            <button
                              onClick={() => handleVerify(s.id, 'VERIFIED')}
                              disabled={updatingId === s.id}
                              className="bg-teal text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-teal-dark transition-colors disabled:opacity-50">
                              {updatingId === s.id ? '...' : 'Verify'}
                            </button>
                            <button
                              onClick={() => handleVerify(s.id, 'REJECTED')}
                              disabled={updatingId === s.id}
                              className="border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                              Reject
                            </button>
                          </>
                        )}
                        {status === 'REJECTED' && (
                          <button
                            onClick={() => handleVerify(s.id, 'VERIFIED')}
                            disabled={updatingId === s.id}
                            className="bg-teal text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-teal-dark transition-colors disabled:opacity-50">
                            {updatingId === s.id ? '...' : 'Verify'}
                          </button>
                        )}
                        {status === 'VERIFIED' && (
                          <button
                            onClick={() => handleVerify(s.id, 'REJECTED')}
                            disabled={updatingId === s.id}
                            className="border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(s.id, s.isActive)}
                          disabled={updatingId === s.id}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            s.isActive
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-teal hover:bg-teal-light'
                          }`}>
                          {s.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} students
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

export default AdminStudentsPage;