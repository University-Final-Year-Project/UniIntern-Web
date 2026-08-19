import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../services/api';

interface Company {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  companyProfile: {
    companyName: string;
    industry: string | null;
    verificationStatus: string;
  } | null;
}

type FilterType = 'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED';

const statusBadge = (status: string) => {
  if (status === 'VERIFIED') return 'bg-teal text-white';
  if (status === 'PENDING') return 'bg-amber-400 text-white';
  return 'bg-red-500 text-white';
};

const ITEMS_PER_PAGE = 10;

const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/companies')
      .then((res) => setCompanies(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleVerify = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setUpdatingId(userId);
      await api.patch(`/admin/companies/${userId}/verify`, { status });
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === userId
            ? { ...c, companyProfile: { ...c.companyProfile!, verificationStatus: status } }
            : c,
        ),
      );
    } catch { alert('Failed to update verification.'); }
    finally { setUpdatingId(null); }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      setUpdatingId(userId);
      await api.patch(`/admin/users/${userId}/status`, { isActive: !isActive });
      setCompanies((prev) =>
        prev.map((c) => c.id === userId ? { ...c, isActive: !isActive } : c),
      );
    } catch { alert('Failed to update status.'); }
    finally { setUpdatingId(null); }
  };

  const filtered = companies.filter((c) => {
    const matchesSearch =
      !search ||
      c.companyProfile?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.companyProfile?.industry?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'ALL' || c.companyProfile?.verificationStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const filterCounts = {
    ALL: companies.length,
    VERIFIED: companies.filter((c) => c.companyProfile?.verificationStatus === 'VERIFIED').length,
    PENDING: companies.filter((c) => c.companyProfile?.verificationStatus === 'PENDING').length,
    REJECTED: companies.filter((c) => c.companyProfile?.verificationStatus === 'REJECTED').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-1">Company Management</h1>
          <p className="text-sm text-gray-400">Manage all registered companies.</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search companies..."
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filter === f
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {f}
              {f === 'PENDING' && filterCounts.PENDING > 0 && (
                <span className="ml-1.5 bg-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {filterCounts.PENDING}
                </span>
              )}
              {f !== 'PENDING' && (
                <span className="ml-1.5 text-gray-400">({filterCounts[f]})</span>
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
              {['Company', 'Industry', 'Status', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 px-6 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400">
                  Loading companies...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400">
                  No companies found.
                </td>
              </tr>
            ) : (
              paginated.map((c) => {
                const p = c.companyProfile;
                const status = p?.verificationStatus ?? 'PENDING';
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {p?.companyName?.charAt(0) ?? 'C'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy">
                            {p?.companyName ?? 'Company'}
                          </p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600">{p?.industry ?? '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleVerify(c.id, 'VERIFIED')}
                              disabled={updatingId === c.id}
                              className="bg-teal text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-teal-dark transition-colors disabled:opacity-50">
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerify(c.id, 'REJECTED')}
                              disabled={updatingId === c.id}
                              className="border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                              Reject
                            </button>
                          </>
                        )}
                        {status === 'REJECTED' && (
                          <button
                            onClick={() => handleVerify(c.id, 'VERIFIED')}
                            disabled={updatingId === c.id}
                            className="border border-gray-200 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                            Review
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(c.id, c.isActive)}
                          disabled={updatingId === c.id}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            c.isActive
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-teal hover:bg-teal-light'
                          }`}>
                          {c.isActive ? 'Deactivate' : 'Activate'}
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
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} companies
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

export default AdminCompaniesPage;