import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  AlertCircle,
  Banknote,
} from 'lucide-react';
import api from '../../services/api';
import { useJobScores } from '../../hooks/useMatchScores';
import MatchBadge from '../../components/common/MatchBadge';
import { type Job, type Pagination } from '../../types';

const CATEGORIES = [
  'Software Engineering',
  'Fintech',
  'Sustainable Energy',
  'Marketing',
];

const SAVED_SEARCHES = [
  'UX Design • San Francisco',
  'Data Science • Remote',
];

const StudentFeedPage: React.FC = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [search, setSearch] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [isPaid, setIsPaid] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Scores for every job on screen, from the shared store used by all screens.
  const getScore = useJobScores(jobs.map((job) => job.id));

  const loadJobs = useCallback(
    async (pageNum = 1, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setHasError(false);

      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (location) params.append('location', location);
        if (type) params.append('type', type);
        if (isPaid) params.append('isPaid', isPaid);
        params.append('page', String(pageNum));
        params.append('limit', '10');

        const res = await api.get(`/jobs?${params.toString()}`);
        const newJobs: Job[] = res.data?.data?.jobs ?? [];
        const newPagination: Pagination = res.data?.data?.pagination;

        if (append) {
          setJobs((prev) => [...prev, ...newJobs]);
        } else {
          setJobs(newJobs);
        }
        setPagination(newPagination);
      } catch (err) {
        console.error('Failed to load feed jobs:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [search, location, type, isPaid],
  );

  useEffect(() => {
    loadJobs(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadJobs(1);
  };

  const handleCategoryClick = (category: string) => {
    setSearch(category);
    setPage(1);
    setTimeout(() => loadJobs(1), 0);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadJobs(nextPage, true);
  };

  const toggleBookmark = (jobId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1 block">
                Discovery
              </span>
              <h1 className="text-2xl font-extrabold text-navy tracking-tight">
                Explore Opportunities
              </h1>
            </div>

            {/* Saved Searches */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-navy tracking-wider uppercase">
                  Saved Searches
                </h3>
                <Clock className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="space-y-2">
                {SAVED_SEARCHES.map((query) => (
                  <button
                    key={query}
                    onClick={() => {
                      const [term] = query.split(' • ');
                      setSearch(term);
                      setPage(1);
                      setTimeout(() => loadJobs(1), 0);
                    }}
                    className="w-full flex items-center gap-2 text-left text-xs text-gray-600 hover:text-blue-600 py-1 transition-colors group">
                    <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    <span className="truncate">{query}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm">
              <h3 className="text-xs font-bold text-navy tracking-wider uppercase mb-3">
                Popular Categories
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="text-xs font-medium bg-gray-50 hover:bg-navy hover:text-white text-gray-600 px-3 py-1.5 rounded-xl border border-gray-200/60 transition-all">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-navy rounded-2xl p-5 text-white relative overflow-hidden shadow-sm">
              <div className="absolute -bottom-4 -right-4 text-white/5 pointer-events-none">
                <Sparkles className="w-32 h-32" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-2 block">
                Pro Tip
              </span>
              <p className="text-sm font-semibold leading-snug mb-4">
                Complete your profile and skills to boost AI matching accuracy.
              </p>
              <Link
                to="/profile/edit"
                className="inline-flex items-center gap-1.5 bg-white text-navy text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                Update Profile
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* Search Bar */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-3 mb-6">
              <form
                onSubmit={handleSearch}
                className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-gray-50/80 rounded-xl border border-gray-200/60 focus-within:border-blue-500 focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search roles, skills, or companies..."
                    className="w-full text-xs sm:text-sm text-navy bg-transparent focus:outline-none placeholder:text-gray-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 md:flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-gray-50/80 text-xs font-semibold text-gray-700 border border-gray-200/60 rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}>
                      <option value="">Location</option>
                      <option value="remote">Remote</option>
                      <option value="accra">Accra</option>
                      <option value="kumasi">Kumasi</option>
                    </select>
                    <MapPin className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-gray-50/80 text-xs font-semibold text-gray-700 border border-gray-200/60 rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                      value={type}
                      onChange={(e) => setType(e.target.value)}>
                      <option value="">Job Type</option>
                      <option value="FULL_TIME">Full-time</option>
                      <option value="PART_TIME">Part-time</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                    <Briefcase className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-gray-50/80 text-xs font-semibold text-gray-700 border border-gray-200/60 rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                      value={isPaid}
                      onChange={(e) => setIsPaid(e.target.value)}>
                      <option value="">Stipend</option>
                      <option value="true">Paid</option>
                      <option value="false">Unpaid</option>
                    </select>
                    <DollarSign className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button
                    type="submit"
                    className="col-span-3 md:col-span-1 bg-navy text-white px-4 py-2.5 rounded-xl hover:bg-navy/90 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Results Header */}
            {!isLoading && !hasError && (
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Showing{' '}
                  <span className="font-bold text-navy">
                    {pagination?.total ?? jobs.length}
                  </span>{' '}
                  {search ? `positions for "${search}"` : 'available positions'}
                </p>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-400 hidden sm:inline">Sorted by:</span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Recommended
                  </span>
                </div>
              </div>
            )}

            {/* States */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 border border-gray-200/80 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 pt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasError ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-sm">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl inline-block mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy mb-1">
                  Error fetching listings
                </h3>
                <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                  We couldn't retrieve the latest job opportunities.
                </p>
                <button
                  onClick={() => loadJobs(1)}
                  className="bg-navy text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-navy/90 transition-colors">
                  Reload Feed
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy mb-1">
                  No matching opportunities
                </h3>
                <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
                  Try adjusting your search or clearing filters.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setLocation('');
                    setType('');
                    setIsPaid('');
                    setPage(1);
                    loadJobs(1);
                  }}
                  className="bg-gray-100 text-navy hover:bg-gray-200 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const isBookmarked = bookmarks.has(job.id);
                  const companyName = job.company?.companyProfile?.companyName;
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(job.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24),
                  );

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:border-gray-300 hover:shadow transition-all overflow-hidden flex flex-col sm:flex-row">

                      {/* Job Info */}
                      <div
                        className="flex-1 p-5 cursor-pointer flex flex-col justify-between"
                        onClick={() => navigate(`/jobs/${job.id}`)}>
                        <div>
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center font-bold text-navy text-base flex-shrink-0">
                              {companyName?.charAt(0) ?? 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-base font-bold text-navy truncate hover:text-blue-600 transition-colors">
                                  {job.title}
                                </h3>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark(job.id);
                                  }}
                                  className="text-gray-300 hover:text-navy p-1 transition-colors flex-shrink-0 sm:hidden">
                                  <Bookmark
                                    className={`w-4 h-4 ${
                                      isBookmarked ? 'fill-navy text-navy' : ''
                                    }`}
                                  />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 truncate">
                                <span>{companyName ?? 'Company'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  {job.location ?? 'Remote'}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-gray-200/60">
                              <Briefcase className="w-3 h-3 text-gray-400" />
                              {job.type ? job.type.replace('_', ' ') : 'Full-Time'}
                            </span>
                            {job.isPaid && job.stipend && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-100">
                                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                                GH₵{job.stipend}/mo
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-gray-200/60">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {daysAgo === 0 ? 'Posted today' : `${daysAgo}d ago`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Match + Apply */}
                      <div className="border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50/40 p-4 sm:px-6 sm:py-5 flex sm:flex-col items-center justify-between sm:justify-center gap-4 min-w-[150px] flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleBookmark(job.id)}
                          className="hidden sm:block text-gray-300 hover:text-navy transition-colors self-end">
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked ? 'fill-navy text-navy' : ''
                            }`}
                          />
                        </button>

                        <MatchBadge entry={getScore(job.id)} variant="circle" caption />

                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="w-auto sm:w-full bg-navy text-white hover:bg-navy/90 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm">
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {pagination?.hasNextPage && !isLoading && !hasError && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-white border border-gray-200/80 text-navy font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-xs shadow-sm disabled:opacity-60 inline-flex items-center gap-2">
                  {isLoadingMore ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                      Fetching listings...
                    </>
                  ) : (
                    'Load More Opportunities'
                  )}
                </button>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  Showing {jobs.length} of {pagination.total} positions
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentFeedPage;