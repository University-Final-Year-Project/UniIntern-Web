import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Banknote,
  Clock,
  Calendar,
  Users,
  // Sparkles,
  Check,
  // Circle,
  GraduationCap,
  Wrench,
  Laptop,
  Utensils,
  Plane,
  MapPin,
  Share2,
  Heart,
  Globe,
  Bookmark,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { getMatchScore } from '../../services/matchScoreCache';
import { type Job } from '../../types';

interface Application {
  id: string;
  jobPostingId?: string;
  jobPosting?: { id: string };
}

interface MatchResponse {
  score: number;
  reason: string;
}

const JobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setMatchScore] = useState<number | null>(null);
  const [, setMatchReason] = useState('');
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [similarScores, setSimilarScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const controller = new AbortController();

    const loadJob = async () => {
      if (!jobId) return;

      try {
        setIsLoading(true);

        // Fetch initial datasets in parallel
        const [jobRes, appsRes, allJobsRes] = await Promise.all([
          api.get<{ data: Job }>(`/jobs/${jobId}`, { signal: controller.signal }),
          api.get<{ data: Application[] }>('/applications/my-applications', { signal: controller.signal }),
          api.get<{ data: { jobs: Job[] } }>('/jobs?limit=4', { signal: controller.signal }),
        ]);

        const jobData = jobRes.data?.data;
        setJob(jobData);

        const apps = appsRes.data?.data ?? [];
        setAlreadyApplied(
          apps.some((a) => a.jobPosting?.id === jobId || a.jobPostingId === jobId)
        );

        const allJobs = allJobsRes.data?.data?.jobs ?? [];
        setSimilarJobs(allJobs.filter((j: Job) => j.id !== jobId).slice(0, 3));

        const similar = allJobs.filter((j: Job) => j.id !== jobId).slice(0, 3);
        setSimilarJobs(similar);

        // Load scores for similar jobs
        similar.forEach(async (j: Job) => {
          try {
            const { score } = await getMatchScore(j.id);
            setSimilarScores((prev) => ({ ...prev, [j.id]: score }));
          } catch {
            setSimilarScores((prev) => ({ ...prev, [j.id]: 0 }));
          }
        });

        // Fetch match breakdown after validating job existence
        try {
          const scoreRes = await api.get<{ data: MatchResponse }>(`/jobs/${jobId}/match`, {
            signal: controller.signal,
          });
          if (scoreRes.data?.data) {
            setMatchScore(scoreRes.data.data.score);
            setMatchReason(scoreRes.data.data.reason);
          }
        } catch (matchErr) {
          console.warn('Match score unavailable:', matchErr);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error('Error fetching job details:', err);
          navigate('/feed', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();

    return () => {
      controller.abort();
    };
  }, [jobId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-navy font-semibold">Loading...</div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 pt-4">
          <Link to="/feed" className="hover:text-navy transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Listings
          </Link>
          <span>/</span>
          <span className="text-navy font-medium">{job.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Job Header */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
              {/* Decorative Circle */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-8 translate-x-8 pointer-events-none z-0" />

              {/* Header Content */}
              <div className="relative z-10 flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-navy font-bold text-xl">
                    {job.company?.companyProfile?.companyName?.charAt(0) ?? 'C'}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-navy leading-tight mb-1">
                    {job.title}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {job.company?.companyProfile?.companyName ?? 'Company'} •{' '}
                    <span className="text-blue-600 font-medium">
                      {job.location ?? 'Remote'}
                    </span>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {alreadyApplied ? (
                    <div className="bg-gray-100 text-gray-500 font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-1.5">
                      Already Applied <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/jobs/${job.id}/apply`)}
                      className="bg-navy text-white font-semibold px-6 py-3 rounded-xl hover:bg-navy-light transition-colors text-sm"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="relative z-10 flex flex-wrap gap-2">
                {job.isPaid && job.stipend && (
                  <span className="flex items-center gap-1.5 bg-gray-50 text-gray-500 text-xs px-3 py-1.5 rounded-full border border-gray-100">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" /> GH₵{job.stipend}/mo
                  </span>
                )}
                {job.type && (
                  <span className="flex items-center gap-1.5 bg-gray-50 text-gray-500 text-xs px-3 py-1.5 rounded-full border border-gray-100">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> {job.type.replace('_', '-')}
                    {job.duration ? ` (${job.duration})` : ''}
                  </span>
                )}
                {job.deadline && (
                  <span className="flex items-center gap-1.5 bg-gray-50 text-gray-500 text-xs px-3 py-1.5 rounded-full border border-gray-100">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Deadline:{' '}
                    {new Date(job.deadline).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-gray-50 text-gray-500 text-xs px-3 py-1.5 rounded-full border border-gray-100">
                  <Users className="w-3.5 h-3.5 text-indigo-500" /> {job._count?.applications ?? 0} applicants
                </span>
              </div>
            </div>

            {/* AI Match Breakdown
            {matchScore !== null && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-navy">
                      AI Match Breakdown
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-navy">{matchScore}%</p>
                    <p className="text-xs text-gray-400">Match Score</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-teal tracking-wide uppercase mb-2">
                      Skills Match
                    </p>
                    <div className="space-y-2">
                      {(job.skillsRequired ?? []).slice(0, 3).map((skill, i) => (
                        <div key={skill} className="flex items-center gap-2">
                          {i < 2 ? (
                            <Check className="w-4 h-4 text-teal" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-600">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-500 tracking-wide uppercase mb-2">
                      AI Insight
                    </p>
                    <p className="text-sm text-gray-500 italic leading-5">
                      "{matchReason}"
                    </p>
                  </div>
                </div>
              </div>
            )} */}

            {/* About the Role */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-navy mb-3">About the Role</h2>
              <p className="text-sm text-gray-500 leading-7">{job.description}</p>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-navy mb-4">
                  Key Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-navy mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500 leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {(job.academicRequirements || (job.skillsRequired && job.skillsRequired.length > 0)) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-navy mb-4">Requirements</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {job.academicRequirements && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 text-navy" />
                        <p className="text-xs font-bold text-navy">Education</p>
                      </div>
                      <p className="text-xs text-gray-500 leading-5">
                        {job.academicRequirements}
                      </p>
                    </div>
                  )}
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-navy" />
                        <p className="text-xs font-bold text-navy">Skills Required</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.skillsRequired.map((skill) => (
                          <span
                            key={skill}
                            className="bg-white text-gray-500 text-[10px] px-2 py-0.5 rounded border border-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Internship Benefits */}
            <div className="bg-navy rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5">
                Internship Benefits
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Laptop, label: 'Tech Stipend' },
                  { icon: Users, label: 'Mentorship' },
                  { icon: Utensils, label: 'Free Lunch' },
                  { icon: Plane, label: 'Travel Credits' },
                ].map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.label} className="text-center flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-2">
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-white/70 text-xs">{b.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Similar Roles */}
            {similarJobs.length > 0 && (
              <div>
                <div className="mb-4">
                  <p className="text-xs font-bold text-teal tracking-widest uppercase mb-1">
                    More Opportunities
                  </p>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-navy">
                      Similar Roles for You
                    </h2>
                    <Link
                      to="/feed"
                      className="text-sm text-navy font-semibold hover:underline flex items-center gap-1"
                    >
                      Browse all <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {similarJobs.map((sJob) => {
                    const similarScore = similarScores[sJob.id];

                    return (
                      <div
                        key={sJob.id}
                        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/jobs/${sJob.id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                            <span className="text-navy font-bold text-xs">
                              {sJob.company?.companyProfile?.companyName?.charAt(0) ?? 'C'}
                            </span>
                          </div>
                          {sJob.type && (
                            <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-100 uppercase">
                              {sJob.type.replace('_', '-')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-navy mb-0.5">
                          {sJob.title}
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          {sJob.company?.companyProfile?.companyName} •{' '}
                          {sJob.location ?? 'Remote'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-teal">
                            {similarScore !== undefined ? `${similarScore}% Match` : '...'}
                          </span>
                          <Bookmark className="w-4 h-4 text-gray-300 hover:text-navy" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* About the Company */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
                About the Company
              </p>
              {job.company?.id && (
                <div
                  className="h-32 rounded-xl bg-gray-100 mb-4 overflow-hidden cursor-pointer relative"
                  onClick={() => navigate(`/company/${job.company.id}`)}
                >
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"
                    alt="Company"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-xs font-bold">
                      {job.company.companyProfile?.companyName ?? 'Company'}
                    </p>
                    <p className="text-white/60 text-[10px]">
                      {job.company.companyProfile?.industry ?? 'Technology'}
                    </p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 leading-5 mb-3">
                {job.company?.companyProfile?.companyName ?? 'This company'} is building the future
                of their industry. Connect with their team and explore career opportunities.
              </p>
              {job.company?.id && (
                <button
                  onClick={() => navigate(`/company/${job.company.id}`)}
                  className="text-navy text-xs font-bold hover:underline flex items-center gap-1"
                >
                  View Company Profile <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
                Location
              </p>
              <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 mb-3">
                <Globe className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {job.location ?? 'Remote'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" /> Save
              </button>
            </div>

            {/* Apply CTA */}
            {!alreadyApplied && (
              <button
                onClick={() => navigate(`/jobs/${job.id}/apply`)}
                className="w-full bg-navy text-white font-semibold py-4 rounded-xl hover:bg-navy-light transition-colors flex items-center justify-center gap-2"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;