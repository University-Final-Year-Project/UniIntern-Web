import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Upload,
  Inbox,
  GraduationCap,
  MoreHorizontal,
  Sparkles,
  Check,
  BarChart2,
} from 'lucide-react';
import api from '../../services/api';
import { useApplicantScores } from '../../hooks/useMatchScores';
import MatchBadge from '../../components/common/MatchBadge';
import { averageScore, getMatchStyle } from '../../utils/matchScore';

interface Applicant {
  id: string;
  status: string;
  appliedAt: string;
  coverNote: string | null;
  student: {
    id: string;
    studentProfile: {
      firstName: string;
      lastName: string;
      university: string | null;
      courseOfStudy: string | null;
      yearOfStudy: number | null;
      skills: string[];
      avatarUrl: string | null;
      biography: string | null;
    } | null;
  };
}

type FilterType = 'ALL' | 'TOP' | 'REVIEW' | 'SHORTLISTED';

const ReviewApplicantsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [sortBy, setSortBy] = useState('match');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [jobIds, setJobIds] = useState<string[]>([]);

  // Scores come from the server, worked out the same way the student sees them.
  const getEntry = useApplicantScores(jobIds);
  const getScore = (app: Applicant): number | undefined => getEntry(app.id).data?.score;

  useEffect(() => {
    const load = async () => {
      try {
        let appsData: Applicant[] = [];

        if (jobId) {
          const [jobRes, appsRes] = await Promise.all([
            api.get(`/jobs/${jobId}`),
            api.get(`/applications/job/${jobId}`),
          ]);
          setJobTitle(jobRes.data.data.title);
          appsData = appsRes.data.data ?? [];
          setJobIds([jobId]);
        } else {
          const jobsRes = await api.get('/jobs/company/my-jobs');
          const jobs = jobsRes.data.data ?? [];
          if (jobs.length > 0) {
            setJobTitle('All Candidates');
            const appsArrays = await Promise.all(
              jobs.slice(0, 5).map((j: any) =>
                api.get(`/applications/job/${j.id}`).then((r) => r.data.data ?? []),
              ),
            );
            appsData = appsArrays.flat();
            setJobIds(jobs.slice(0, 5).map((j: { id: string }) => j.id));
          }
        }

        setApplicants(appsData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [jobId]);

  const handleAction = async (applicationId: string, status: string) => {
    try {
      setUpdatingId(applicationId);
      await api.patch(`/applications/${applicationId}/status`, { status });
      setApplicants((prev) =>
        prev.map((a) => a.id === applicationId ? { ...a, status } : a),
      );
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplicants = applicants
    .filter((a) => {
      const score = getScore(a);
      if (filter === 'TOP') return score !== undefined && score >= 85;
      if (filter === 'REVIEW') return a.status === 'PENDING';
      if (filter === 'SHORTLISTED') return a.status === 'SHORTLISTED';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return (getScore(b) ?? -1) - (getScore(a) ?? -1);
      if (sortBy === 'date') return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      if (sortBy === 'name') {
        const nameA = `${a.student.studentProfile?.firstName} ${a.student.studentProfile?.lastName}`;
        const nameB = `${b.student.studentProfile?.firstName} ${b.student.studentProfile?.lastName}`;
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  const totalApplied = applicants.length;
  const highMatches = applicants.filter((a) => (getScore(a) ?? -1) >= 85).length;
  const shortlistedCount = applicants.filter((a) => a.status === 'SHORTLISTED').length;
  const avgScore = averageScore(applicants.map(getScore));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    day.setHours(0, 0, 0, 0);
    return applicants.filter((a) => {
      const applied = new Date(a.appliedAt);
      applied.setHours(0, 0, 0, 0);
      return applied.getTime() === day.getTime();
    }).length;
  });
  const maxTrend = Math.max(...last7Days, 1);
  const trendHeights = last7Days.map((v) => Math.round((v / maxTrend) * 55) + 5);

  const tabs: { key: FilterType; label: string; count?: number }[] = [
    { key: 'ALL', label: 'All Candidates' },
    { key: 'TOP', label: 'Top Matches', count: highMatches },
    { key: 'REVIEW', label: 'Under Review', count: applicants.filter((a) => a.status === 'PENDING').length },
    { key: 'SHORTLISTED', label: 'Shortlisted', count: shortlistedCount },
  ];

  const avatarColors = [
    'bg-purple-400', 'bg-blue-400', 'bg-teal', 'bg-amber-400', 'bg-pink-400',
  ];

  const handleExport = () => {
    const csv = [
      'Name,University,Course,Skills,Status,Applied At',
      ...filteredApplicants.map((app) => {
        const p = app.student.studentProfile;
        return `${p?.firstName} ${p?.lastName},${p?.university ?? ''},${p?.courseOfStudy ?? ''},"${(p?.skills ?? []).join(', ')}",${app.status},${new Date(app.appliedAt).toLocaleDateString()}`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_${jobTitle.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link to="/listings" className="hover:text-navy transition-colors">
          My Listings
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy font-medium">{jobTitle}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-0.5">Candidate Review Board</h1>
          <p className="text-sm text-gray-400">
            {jobTitle} {jobId ? '| Your Company' : ''}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 border border-gray-200 text-navy text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <Upload className="w-4 h-4" /> Export List
        </button>
      </div>

      {/* Filter Tabs + Sort */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                filter === t.key
                  ? 'bg-navy text-white'
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-navy hover:text-navy'
              }`}>
              {t.label}
              {t.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort by:</span>
          <select
            className="text-xs font-semibold text-navy border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}>
            <option value="match">Best Match</option>
            <option value="date">Date Applied</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Candidates List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="text-center py-20 text-gray-400">Loading candidates...</div>
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
              <Inbox className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-navy font-bold mb-2">No candidates in this category</p>
              <p className="text-gray-400 text-sm">Try a different filter.</p>
            </div>
          ) : (
            filteredApplicants.map((app, i) => {
              const profile = app.student.studentProfile;
              const entry = getEntry(app.id);
              const score = entry.data?.score;
              const scoreStyle = score !== undefined ? getMatchStyle(score) : null;
              const color = avatarColors[i % avatarColors.length];
              const isShortlisted = app.status === 'SHORTLISTED';
              const isRejected = app.status === 'REJECTED';

              return (
                <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

                  {/* Student Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {profile?.firstName?.charAt(0) ?? 'S'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-navy">
                            {profile?.firstName} {profile?.lastName}
                          </h3>
                          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {profile?.university ?? 'University'}
                            {profile?.yearOfStudy ? ` • Year ${profile.yearOfStudy}` : ''}
                            {profile?.courseOfStudy ? ` • ${profile.courseOfStudy}` : ''}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(profile?.skills ?? []).slice(0, 3).map((skill) => (
                              <span key={skill} className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button className="text-gray-300 hover:text-navy transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Match Score + why */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex flex-col items-center">
                      <MatchBadge entry={entry} variant="ring" size={56} />
                      {scoreStyle && (
                        <span className={`text-[10px] font-bold mt-1 ${scoreStyle.text}`}>
                          {scoreStyle.label.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={`flex-1 ${scoreStyle?.bg ?? 'bg-gray-50'} rounded-xl p-3`}>
                      <p className="text-[10px] font-bold text-teal-dark flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3" /> WHY THIS SCORE
                      </p>
                      <p className="text-xs text-gray-600 leading-5">
                        {entry.data
                          ? entry.data.reason
                          : entry.status === 'error'
                            ? 'The match score is not available right now.'
                            : 'Working out the match...'}
                      </p>
                      {entry.data && (
                        <p className="text-[11px] text-gray-500 leading-4 mt-1">
                          {entry.data.matchedSkills.length > 0
                            ? `Matches: ${entry.data.matchedSkills.join(', ')}.`
                            : 'No required skills matched.'}
                          {entry.data.missingSkills.length > 0 &&
                            ` Missing: ${entry.data.missingSkills.join(', ')}.`}
                        </p>
                      )}
                      {profile?.biography && (
                        <p className="text-[11px] text-gray-400 leading-4 mt-1">
                          About: {profile.biography.substring(0, 150)}
                          {profile.biography.length > 150 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isShortlisted ? (
                      <div className="flex items-center gap-2 bg-teal-light text-teal-dark text-sm font-semibold px-4 py-2.5 rounded-xl">
                        <Check className="w-4 h-4 text-teal" /> Shortlisted
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAction(app.id, 'SHORTLISTED')}
                        disabled={updatingId === app.id || isRejected}
                        className="bg-navy text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-navy-light transition-colors disabled:opacity-50">
                        {updatingId === app.id ? '...' : 'Shortlist'}
                      </button>
                    )}

                    {!isRejected && !isShortlisted && (
                      <button
                        onClick={() => handleAction(app.id, 'REJECTED')}
                        disabled={updatingId === app.id}
                        className="border border-red-200 text-red-500 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
                        Reject
                      </button>
                    )}

                    {isRejected && (
                      <div className="flex items-center gap-2 bg-red-50 text-red-400 text-sm font-semibold px-4 py-2.5 rounded-xl">
                        Rejected
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/students/${app.student.id}`)}
                      className="ml-auto border border-gray-200 text-navy text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">

          {/* Pipeline Overview */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-navy" />
              <h2 className="text-base font-bold text-navy">Pipeline Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-navy">{totalApplied}</p>
                <p className="text-xs text-gray-400">Total Applied</p>
              </div>
              <div className="bg-teal-light rounded-xl p-3">
                <p className="text-2xl font-bold text-teal">{highMatches}</p>
                <p className="text-xs text-teal-dark font-medium">High Matches</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-400 mb-2">Application Trend (7 Days)</p>
            <svg viewBox="0 0 200 60" className="w-full h-14">
              {trendHeights.map((v, i) => (
                <rect
                  key={i}
                  x={i * 28 + 2}
                  y={60 - v}
                  width="22"
                  height={v}
                  rx="4"
                  fill={i === 6 ? '#00c896' : '#1a2b4a'}
                  opacity={i === 6 ? 1 : 0.7}
                />
              ))}
            </svg>
          </div>

          {/* Role Insights */}
          <div className="bg-navy rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal" />
              <h2 className="text-base font-bold text-white">Role Insights</h2>
            </div>
            <p className="text-xs text-white/60 leading-5 mb-4">
              Candidates scoring &gt;85% on this listing frequently possess strong technical
              skills. Consider prioritizing profiles with relevant project experience.
            </p>

            <div className="mb-4">
              <p className="text-[10px] font-bold text-teal tracking-widest uppercase mb-2">
                Most Common Top Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(
                  new Set(applicants.flatMap((a) => a.student.studentProfile?.skills ?? [])),
                ).slice(0, 4).map((skill) => (
                  <span key={skill} className="bg-white/10 text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
                {applicants.length === 0 && (
                  <p className="text-xs text-white/40">No data yet</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-teal tracking-widest uppercase mb-2">
                Target Universities (Matched)
              </p>
              <div className="space-y-1">
                {Array.from(
                  new Set(
                    applicants.map((a) => a.student.studentProfile?.university).filter(Boolean),
                  ),
                ).slice(0, 3).map((uni) => (
                  <p key={uni} className="text-xs text-white/60">{uni}</p>
                ))}
                {applicants.length === 0 && (
                  <p className="text-xs text-white/40">No data yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Avg Match */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              Avg Match Score
            </p>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-navy">
                {avgScore !== null
                  ? `${avgScore}%`
                  : applicants.some((a) => getEntry(a.id).status === 'loading')
                    ? '...'
                    : '—'}
              </p>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal rounded-full" style={{ width: `${avgScore ?? 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewApplicantsPage;