import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Zap, 
  ClipboardList, 
  Calendar, 
  ArrowRight, 
  Briefcase,
  Building2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useJobScores } from '../../hooks/useMatchScores';
import MatchBadge from '../../components/common/MatchBadge';
import ApplicationCalendar from '../../components/student/ApplicationCalendar';
import { type Job, type Application } from '../../types';


const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/60',
  SHORTLISTED: 'bg-blue-50 text-blue-700 border-blue-200/60',
  INTERVIEWING: 'bg-purple-50 text-purple-700 border-purple-200/60',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  REJECTED: 'bg-gray-100 text-gray-600 border-gray-200/60',
};

const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = user?.studentProfile as any;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const hasFetched = useRef(false);

  // Scores come from the shared store, the same numbers the feed and job page show.
  const getScore = useJobScores(jobs.map((job) => job.id));

  // Recommended matches are the best scoring jobs. We wait until every score has
  // finished loading before sorting, so the cards do not jump around.
  const recommended = useMemo(() => {
    const entries = jobs.map((job) => ({ job, entry: getScore(job.id) }));
    const settled = entries.every(({ entry }) => entry.status === 'ready' || entry.status === 'error');
    if (!settled) return entries.slice(0, 2);
    return [...entries]
      .sort((a, b) => (b.entry.data?.score ?? -1) - (a.entry.data?.score ?? -1))
      .slice(0, 2);
  }, [jobs, getScore]);


  const loadData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const [jobsRes, appsRes] = await Promise.allSettled([
        api.get('/jobs?limit=6'),
        api.get('/applications/my-applications'),
      ]);

      let fetchedJobs: Job[] = [];
      if (jobsRes.status === 'fulfilled') {
        fetchedJobs = jobsRes.value.data?.data?.jobs ?? jobsRes.value.data?.jobs ?? [];
      }

      let fetchedApps: Application[] = [];
      if (appsRes.status === 'fulfilled') {
        fetchedApps = appsRes.value.data?.data ?? appsRes.value.data ?? [];
      }

      setJobs(fetchedJobs);
      setApplications(fetchedApps);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
  if (hasFetched.current) return;
  hasFetched.current = true;
  loadData();
}, []);

  const appliedCount = applications.length;
  const pendingCount = useMemo(
    () => applications.filter((a) => a.status === 'PENDING').length,
    [applications]
  );
  const interviewCount = useMemo(
    () => applications.filter((a) => a.status === 'INTERVIEWING').length,
    [applications]
  );

  const completion = useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.firstName?.trim()) score += 20;
    if (profile.university?.trim()) score += 20;
    if (profile.courseOfStudy?.trim()) score += 20;

    const skillsList = Array.isArray(profile.skills)
      ? profile.skills
      : typeof profile.skills === 'string'
      ? profile.skills.split(',').filter(Boolean)
      : [];

    if (skillsList.length > 0) score += 20;
    if (profile.biography?.trim() || profile.bio?.trim()) score += 20;
    return score;
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-navy mb-1">Failed to load dashboard</h3>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
            We encountered a problem fetching your latest data. Please give it another try.
          </p>
          <button
            onClick={loadData}
            className="bg-navy text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-navy/90 transition-colors shadow-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

        {/* Header & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1 block">
              Overview
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Welcome back, {profile?.firstName ?? 'Student'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your internship applications and personalized recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {[
              { val: appliedCount, label: 'APPLIED', primary: false },
              { val: pendingCount, label: 'PENDING', primary: false },
              { val: interviewCount, label: 'INTERVIEWS', primary: true },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl px-5 py-3.5 text-center min-w-[100px] border transition-all ${
                  stat.primary
                    ? 'bg-navy border-navy text-white shadow-sm'
                    : 'bg-white border-gray-200/80 text-navy'
                }`}>
                <p className={`text-2xl font-bold leading-none mb-1 ${stat.primary ? 'text-white' : 'text-navy'}`}>
                  {stat.val}
                </p>
                <p className={`text-[10px] font-bold tracking-widest ${stat.primary ? 'text-white/70' : 'text-gray-400'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completion Alert */}
        {completion < 100 && (
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl flex-shrink-0 mt-0.5 sm:mt-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy">
                  Complete your student profile ({completion}%)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Profiles with verified details receive up to 3× more matching opportunities.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="w-24 sm:w-32 bg-gray-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <Link
                to="/profile/edit"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm">
                Finish Setup
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recommended Jobs */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h2 className="text-base font-bold text-navy">Recommended Matches</h2>
                </div>
                <Link
                  to="/feed"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                  Explore feed
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {recommended.map(({ job, entry }) => {
                  const companyName = job.company?.companyProfile?.companyName;

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:border-gray-300 hover:shadow transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center font-bold text-navy text-sm flex-shrink-0">
                            {companyName?.charAt(0) ?? 'C'}
                          </div>
                          <MatchBadge entry={entry} variant="pill" />
                        </div>

                        <h3 className="text-sm font-bold text-navy line-clamp-1 mb-1">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {companyName ?? 'Company'} • {job.location ?? 'Remote'}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {job.skillsRequired?.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                              {skill}
                            </span>
                          ))}
                          {job.isPaid && (
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                              PAID
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="w-full bg-navy/5 text-navy hover:bg-navy hover:text-white text-xs font-semibold py-2.5 rounded-xl transition-all">
                        View Role
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Application Tracker */}
            <section className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-navy" />
                  <h2 className="text-base font-bold text-navy">Recent Applications</h2>
                </div>
                <Link
                  to="/applications"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  View all ({applications.length})
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                  <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600 mb-1">No active applications</p>
                  <p className="text-xs text-gray-400 mb-4">Start applying to available listings to track your progress here.</p>
                  <Link
                    to="/feed"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                    Find positions
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {applications.slice(0, 4).map((app) => {
                    const companyName = app.jobPosting?.company?.companyProfile?.companyName;
                    return (
                      <div
                        key={app.id}
                        onClick={() => navigate(`/jobs/${app.jobPosting?.id}`)}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-gray-50/80 px-2 rounded-xl transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center text-xs font-bold text-navy flex-shrink-0">
                            {companyName?.charAt(0) ?? 'C'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-navy truncate group-hover:text-blue-600 transition-colors">
                              {app.jobPosting?.title ?? 'Untitled Role'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {companyName ?? 'Company'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase ${
                              STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {app.status}
                          </span>
                          <span className="text-xs text-gray-400 hidden sm:block">
                            {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">

            {/* Upcoming Deadlines */}
            <section className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-navy" />
                  <h2 className="text-base font-bold text-navy">Deadlines</h2>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {jobs
                  .slice(0, 4)
                  .filter((j) => j.deadline)
                  .slice(0, 3)
                  .map((job) => {
                    const date = new Date(job.deadline!);
                    const daysLeft = Math.ceil(
                      (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    const isUrgent = daysLeft <= 2;

                    return (
                      <div key={job.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div
                          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white font-bold ${
                            isUrgent ? 'bg-red-500' : 'bg-navy'
                          }`}>
                          <span className="text-xs leading-none">{date.getDate()}</span>
                          <span className="text-[9px] font-medium uppercase opacity-80 mt-0.5">
                            {date.toLocaleString('default', { month: 'short' })}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-navy truncate">
                            {job.title}
                          </p>
                          <p className={`text-[11px] font-medium flex items-center gap-1 mt-0.5 ${isUrgent ? 'text-red-600' : 'text-gray-400'}`}>
                            <Clock className="w-3 h-3" />
                            {daysLeft <= 0
                              ? 'Closing today'
                              : daysLeft === 1
                              ? 'Closing tomorrow'
                              : `${daysLeft} days remaining`}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                {jobs.slice(0, 4).filter((j) => j.deadline).length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-400">
                    No urgent deadlines scheduled.
                  </div>
                )}
              </div>
            </section>

            {/* Application calendar */}
            <ApplicationCalendar applications={applications} />

          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardPage;