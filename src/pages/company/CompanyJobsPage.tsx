import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  MapPin,
  Banknote,
  Clock,
  ClipboardList,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  location: string | null;
  type: string;
  isPaid: boolean;
  stipend: number | null;
  duration: string | null;
  isActive: boolean;
  deadline: string | null;
  vacancies: number;
  imageUrl: string | null;
  createdAt: string;
  _count: { applications: number };
}

type TabType = 'ALL' | 'ACTIVE' | 'DRAFT' | 'CLOSED';

const CompanyJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<TabType>('ALL');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const res = await api.get('/jobs/company/my-jobs');
      setJobs(res.data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleToggle = async (jobId: string, isActive: boolean) => {
    try {
      setTogglingId(jobId);
      await api.patch(`/jobs/${jobId}/toggle`, { isActive: !isActive });
      setJobs((prev) =>
        prev.map((j) => j.id === jobId ? { ...j, isActive: !isActive } : j),
      );
    } catch {
      alert('Failed to update job status.');
    } finally {
      setTogglingId(null);
    }
  };

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredJobs = jobs.filter((j) => {
    if (tab === 'ALL') return true;
    if (tab === 'ACTIVE') return j.isActive;
    if (tab === 'CLOSED') return !j.isActive;
    return false;
  });

  const totalApplicants = jobs.reduce((sum, j) => sum + j._count.applications, 0);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'ALL', label: `All Listings (${jobs.length})` },
    { key: 'ACTIVE', label: `Active (${jobs.filter((j) => j.isActive).length})` },
    { key: 'DRAFT', label: 'Drafts (0)' },
    { key: 'CLOSED', label: `Closed (${jobs.filter((j) => !j.isActive).length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-1">
            My Internship Listings
          </h1>
          <p className="text-sm text-gray-400">
            Manage and track your active internship opportunities.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Total Applicants Card */}
          <div className="bg-navy rounded-2xl px-6 py-4 text-right">
            <p className="text-xs text-white/60 uppercase tracking-wide mb-1">
              Total Applicants
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-white">
                {totalApplicants.toLocaleString()}
              </p>
              <span className="text-teal text-sm">↑</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/post-job')}
            className="bg-navy text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-navy-light transition-colors flex items-center gap-2">
            + Post New Internship
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.key
                ? 'bg-navy text-white'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-navy hover:text-navy'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading listings...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-navy font-bold text-lg mb-2">No listings found</p>
          <p className="text-gray-400 text-sm mb-6">
            Post your first internship to start receiving applications.
          </p>
          <button
            onClick={() => navigate('/post-job')}
            className="bg-navy text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-navy-light transition-colors">
            + Post New Internship
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const daysLeft = getDaysLeft(job.deadline);
            const isUrgent = daysLeft !== null && daysLeft <= 5;
            return (
              <div
                key={job.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  !job.isActive ? 'border-dashed border-gray-200 opacity-75' : 'border-gray-100'
                }`}>
                <div className="flex gap-5 p-6">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative">
                    {job.imageUrl ? (
                      <img
                        src={job.imageUrl}
                        alt={job.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    {job.isActive && (
                      <div className="absolute bottom-1 left-1 bg-teal text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                            {job.type.replace('_', ' ')}
                          </span>
                          {job.location && (
                            <span className="bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {job.location}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-navy">{job.title}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-3 mt-1">
                          {job.isPaid && job.stipend && (
                            <span className="flex items-center gap-1">
                              <Banknote className="w-4 h-4 text-gray-400" /> GH₵{job.stipend}/mo
                            </span>
                          )}
                          {!job.isPaid && <span>Unpaid</span>}
                          {job.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" /> {job.duration}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleToggle(job.id, job.isActive)}
                          disabled={togglingId === job.id}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            job.isActive ? 'bg-teal' : 'bg-gray-200'
                          }`}>
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              job.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <p className="text-xl font-bold text-navy">
                          {job._count.applications}
                        </p>
                        <p className="text-xs text-gray-400">Applicants</p>
                      </div>
                      <div className={`rounded-xl px-4 py-3 border ${
                        isUrgent
                          ? 'bg-red-50 border-red-100'
                          : 'bg-gray-50 border-gray-100'
                      }`}>
                        <p className={`text-xl font-bold ${isUrgent ? 'text-red-500' : 'text-navy'}`}>
                          {daysLeft !== null ? daysLeft : '—'}
                        </p>
                        <p className={`text-xs ${isUrgent ? 'text-red-400' : 'text-gray-400'}`}>
                          Days Left
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <p className="text-xl font-bold text-navy">{job.vacancies}</p>
                        <p className="text-xs text-gray-400">Vacancies</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                          className="bg-navy text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-navy-light transition-colors">
                          View Applicants
                        </button>
                        <button
                          onClick={() => navigate(`/jobs/${job.id}/edit`)}
                          className="border border-gray-200 text-navy text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                          Edit
                        </button>
                      </div>
                      <button
                        onClick={() => handleToggle(job.id, job.isActive)}
                        className="text-red-400 text-sm font-semibold hover:text-red-600 transition-colors">
                        {job.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyJobsPage;