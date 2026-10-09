import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useApplicantScores } from '../../hooks/useMatchScores';
import MatchBadge from '../../components/common/MatchBadge';
import { averageScore } from '../../utils/matchScore';
import {
  Briefcase,
  Users,
  Star,
  BarChart2,
  Inbox,
  MoreHorizontal,
  Plus,
  Download,
} from 'lucide-react';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  student: {
    studentProfile: {
      firstName: string;
      lastName: string;
      university: string | null;
      avatarUrl: string | null;
    } | null;
  };
  jobPosting: {
    id: string;
    title: string;
  };
}

interface Job {
  id: string;
  title: string;
  isActive: boolean;
  _count: { applications: number };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-500',
  SHORTLISTED: 'bg-blue-100 text-blue-600',
  INTERVIEWING: 'bg-purple-100 text-purple-600',
  ACCEPTED: 'bg-teal-light text-teal-dark',
  REJECTED: 'bg-red-50 text-red-500',
};

const CompanyDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = user?.companyProfile;
  const [applications, setApplications] = useState<Application[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [scoredJobIds, setScoredJobIds] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const jobsRes = await api.get('/jobs/company/my-jobs');
        const jobsData = jobsRes.data.data ?? [];
        setJobs(jobsData);

        const dashboardJobs: Job[] = jobsData.slice(0, 3);
        setScoredJobIds(dashboardJobs.map((job) => job.id));

        const appsPromises = dashboardJobs.map((job: Job) =>
          api.get(`/applications/job/${job.id}`).then((r) => r.data.data ?? []),
        );
        const appsArrays = await Promise.all(appsPromises);
        const everyApp: Application[] = appsArrays.flat();
        setAllApplications(everyApp);
        setApplications(everyApp.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const totalApplicants = jobs.reduce((sum, j) => sum + j._count.applications, 0);
  const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED').length;

  // Match scores come from the server, the same numbers the students see.
  const getEntry = useApplicantScores(scoredJobIds);
  const avgScore = averageScore(allApplications.map((a) => getEntry(a.id).data?.score));
  const anyLoading = allApplications.some((a) => getEntry(a.id).status === 'loading');

  const topMatches = allApplications
    .filter((a) => a.student?.studentProfile)
    .sort((a, b) => (getEntry(b.id).data?.score ?? -1) - (getEntry(a.id).data?.score ?? -1))
    .slice(0, 3);

  const trendData = [40, 55, 45, 60, 75, 65, 90];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-1">
          Recruitment Dashboard
        </h1>
        <p className="text-sm text-gray-400">
          {profile?.companyName ?? 'Your Company'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Active Listings',
            value: jobs.filter((j: any) => j.isActive).length,
            sub: `${jobs.length} total listings`,
            icon: Briefcase,
            teal: false,
          },
          {
            label: 'Total Applicants',
            value: totalApplicants.toLocaleString(),
            sub: `across ${jobs.length} listings`,
            icon: Users,
            teal: false,
          },
          {
            label: 'Shortlisted',
            value: shortlisted,
            sub: shortlisted > 0 ? 'Action required' : 'None yet',
            icon: Star,
            teal: false,
          },
          {
            label: 'Avg Match Score',
            value: avgScore !== null ? `${avgScore}%` : anyLoading ? '...' : '—',
            sub: null,
            icon: BarChart2,
            teal: true,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-2xl p-5 border shadow-sm ${
                stat.teal
                  ? 'bg-teal border-teal'
                  : 'bg-white border-gray-100'
              }`}>
              <div className="flex justify-between items-start mb-3">
                <p className={`text-xs font-medium ${stat.teal ? 'text-white/70' : 'text-gray-400'}`}>
                  {stat.label}
                </p>
                <Icon className={`w-5 h-5 ${stat.teal ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <p className={`text-3xl font-bold mb-1 ${stat.teal ? 'text-white' : 'text-navy'}`}>
                {stat.value}
              </p>
              {stat.sub && (
                <p className={`text-xs flex items-center gap-1 ${stat.teal ? 'text-white/70' : 'text-teal'}`}>
                  {!stat.teal && '↑'} {stat.sub}
                </p>
              )}
              {stat.teal && (
                <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${avgScore ?? 0}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recent Applications */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-navy">Recent Applications</h2>
              <button
                onClick={() => navigate('/candidates')}
                className="text-sm text-teal font-semibold hover:underline">
                View All
              </button>
            </div>

            {isLoading ? (
              <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No applications yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const status = statusColors[app.status] ?? statusColors.PENDING;
                  const firstName = app.student?.studentProfile?.firstName ?? 'Student';
                  const lastName = app.student?.studentProfile?.lastName ?? '';
                  const university = app.student?.studentProfile?.university ?? 'University';
                  return (
                    <div
                      key={app.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {firstName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy">
                          {firstName} {lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {university} • {app.jobPosting?.title ?? 'Job'}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status}`}>
                        {app.status ? app.status.charAt(0) + app.status.slice(1).toLowerCase() : 'Pending'}
                      </span>
                      <button className="text-gray-300 hover:text-navy transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Plus, label: 'Post New Internship', path: '/post-job', bg: 'bg-navy text-white' },
              { icon: Users, label: 'View All Candidates', path: '/candidates', bg: 'bg-white border border-gray-100' },
              { icon: Download, label: 'Download Report', path: null, bg: 'bg-white border border-gray-100' },            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => {
                    if (action.path) {
                      navigate(action.path);
                    } else {
                      const csv = [
                        'Job Title,Applicants',
                        ...jobs.map((j) => `${j.title},${j._count.applications}`)
                      ].join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'uniintern_report.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className={`${action.bg} rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    action.bg.includes('navy') ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${action.bg.includes('navy') ? 'text-white' : 'text-navy'}`} />
                  </div>
                  <p className={`text-sm font-semibold ${action.bg.includes('navy') ? 'text-white' : 'text-navy'}`}>
                    {action.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Top Matches */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-navy mb-4">Top Matches</h2>
            {topMatches.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No applicants yet.</p>
            ) : (
              topMatches.map((app, i) => {
                const firstName = app.student?.studentProfile?.firstName ?? 'Student';
                const lastName = app.student?.studentProfile?.lastName ?? '';
                const colors = ['bg-teal', 'bg-amber-400', 'bg-blue-400'];
                return (
                  <div key={app.id} className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${colors[i]}`}>
                      {firstName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-navy">
                        {firstName} {lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {app.jobPosting?.title ?? 'Internship'}
                      </p>
                    </div>
                    <MatchBadge entry={getEntry(app.id)} variant="pill" />
                  </div>
                );
              })
            )}
          </div>

          {/* Application Trend */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-navy mb-4">Application Trend</h2>
            <svg viewBox="0 0 200 80" className="w-full h-20">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00c896" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00c896" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0,${80 - trendData[0]} ${trendData.map((v, i) => `L ${i * 33},${80 - v}`).join(' ')}`}
                fill="url(#trendGrad)"
                stroke="none"
              />
              <polyline
                points={trendData.map((v, i) => `${i * 33},${80 - v}`).join(' ')}
                fill="none"
                stroke="#00c896"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={6 * 33} cy={80 - trendData[6]} r="4" fill="#00c896" />
            </svg>
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
          </div>

          {/* Top Listings */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-navy">Top Listings</h2>
              <span className="text-xs text-gray-400">Apps</span>
            </div>
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex justify-between items-center mb-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                onClick={() => navigate(`/jobs/${job.id}/applicants`)}>
                <p className="text-sm text-gray-600">{job.title}</p>
                <span className="text-sm font-bold text-teal">
                  {job._count.applications}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;