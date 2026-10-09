import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { type Job } from '../../types';
import { useJobScores } from '../../hooks/useMatchScores';
import MatchBadge from '../../components/common/MatchBadge';
import { averageScore } from '../../utils/matchScore';
import {
  Building2,
  MapPin,
  Info,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Banknote,
  ArrowRight,
  Globe,
  ClipboardList,
  Users,
  Star,
  Map,
} from 'lucide-react';

interface CompanyProfile {
  id: string;
  companyProfile: {
    companyName: string;
    industry: string | null;
    description: string | null;
    website: string | null;
    location: string | null;
    logoUrl: string | null;
  } | null;
  jobs: Job[];
}

const CompanyPublicProfilePage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);

  // Your match for each of this company's internships, from the shared score store.
  const scoredJobs = (company?.jobs ?? []).slice(0, 10);
  const getScore = useJobScores(scoredJobs.map((job) => job.id));

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/jobs/company/${companyId}`);
        setCompany(res.data.data);
      } catch {
        navigate('/feed');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [companyId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-navy font-semibold">Loading...</div>
      </div>
    );
  }

  if (!company) return null;

  const profile = company.companyProfile;
  const jobs = company.jobs ?? [];
  const visibleJobs = jobs.slice(currentJobIndex, currentJobIndex + 2);
  const listJob = jobs[2];
  const yourAverage = averageScore(scoredJobs.map((job) => getScore(job.id).data?.score));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-6 min-h-screen">
        {/* Cover Banner */}
        <div
          className="h-48 relative"
          style={{ background: 'linear-gradient(135deg, #1a2b4a 0%, #2d4270 60%, #1a2b4a 100%)' }}>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-8 -mt-10 pb-16">
          {/* Company Header */}
          <div className="flex items-end gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profile?.logoUrl ? (
                <img src={profile.logoUrl} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-navy text-3xl font-bold">
                  {profile?.companyName?.charAt(0) ?? 'C'}
                </span>
              )}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-navy mb-2">
                {profile?.companyName ?? 'Company'}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {profile?.industry && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {profile.industry.toUpperCase()}
                  </span>
                )}
                {profile?.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {profile.location.toUpperCase()}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button className="mb-2 bg-teal text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-dark transition-colors">
              Follow Company
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* About Us */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-navy" />
                  <h2 className="text-lg font-bold text-navy">About Us</h2>
                </div>
                <p className="text-sm text-gray-500 leading-7">
                  {profile?.description ??
                    `${profile?.companyName} is a leading organization in the ${
                      profile?.industry ?? 'industry'
                    } sector. We are dedicated to excellence and innovation, creating opportunities for the next generation of professionals.`}
                </p>
              </div>

              {/* Active Internships */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-navy" />
                    <h2 className="text-lg font-bold text-navy">Active Internships</h2>
                  </div>
                  {jobs.length > 2 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentJobIndex(Math.max(0, currentJobIndex - 2))}
                        disabled={currentJobIndex === 0}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-navy hover:text-navy transition-colors disabled:opacity-30">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentJobIndex(Math.min(jobs.length - 2, currentJobIndex + 2))
                        }
                        disabled={currentJobIndex + 2 >= jobs.length}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-navy hover:text-navy transition-colors disabled:opacity-30">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-400 text-sm">No active internships at the moment.</p>
                  </div>
                ) : (
                  <>
                    {/* Featured Jobs Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {visibleJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center">
                              <span className="text-navy font-bold text-sm">
                                {job.title.charAt(0)}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                job.type === 'REMOTE'
                                  ? 'bg-blue-50 text-blue-500'
                                  : job.type === 'FULL_TIME'
                                  ? 'bg-purple-50 text-purple-500'
                                  : 'bg-teal-light text-teal-dark'
                              }`}>
                              {job.type.replace('_', ' ')}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-navy mb-1">{job.title}</h3>
                          <div className="mb-2">
                            <MatchBadge entry={getScore(job.id)} variant="pill" />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {job.location}
                              </span>
                            )}
                            {job.isPaid && job.stipend && (
                              <span className="flex items-center gap-1">
                                <Banknote className="w-3.5 h-3.5" /> GH₵{job.stipend}/mo
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="w-full flex items-center justify-center gap-1 border border-navy text-navy text-xs font-semibold py-2.5 rounded-xl hover:bg-navy hover:text-white transition-colors">
                            View & Apply <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* List Job */}
                    {listJob && (
                      <div
                        className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => navigate(`/jobs/${listJob.id}`)}>
                        <div className="w-9 h-9 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-navy font-bold text-xs">
                            {listJob.title.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-navy">{listJob.title}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {listJob.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {listJob.location}
                              </span>
                            )}
                            {listJob.isPaid && listJob.stipend && (
                              <span className="flex items-center gap-1">
                                <Banknote className="w-3 h-3" /> GH₵{listJob.stipend}/mo
                              </span>
                            )}
                          </div>
                        </div>
                        <MatchBadge entry={getScore(listJob.id)} variant="pill" />
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            listJob.type === 'REMOTE'
                              ? 'bg-blue-50 text-blue-500'
                              : 'bg-teal-light text-teal-dark'
                          }`}>
                          {listJob.type.replace('_', ' ')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${listJob.id}`);
                          }}
                          className="flex items-center gap-1 bg-teal text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-teal-dark transition-colors whitespace-nowrap">
                          Apply <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Company Info */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Company Info
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Industry', value: profile?.industry },
                    { label: 'Location', value: profile?.location },
                    { label: 'Website', value: profile?.website, isLink: true },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-start">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      {item.isLink && item.value ? (
                        <a
                          href={
                            item.value.startsWith('http') ? item.value : `https://${item.value}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-teal hover:underline truncate max-w-[60%]">
                          {item.value}
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-navy text-right max-w-[60%]">
                          {item.value ?? '—'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="h-px bg-gray-100 my-4" />
                <div className="flex gap-3">
                  {profile?.website && (
                    <a
                      href={
                        profile.website.startsWith('http')
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-navy hover:text-navy transition-colors">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  <button className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-navy hover:text-navy transition-colors">
                    <Briefcase className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recruitment Stats */}
              <div className="bg-navy rounded-2xl p-5">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">
                  Recruitment Stats
                </p>
                <div className="space-y-3">
                  {[
                    {
                      icon: <ClipboardList className="w-4 h-4 text-white/70" />,
                      label: 'Active Listings',
                      value: jobs.length,
                    },
                    {
                      icon: <Users className="w-4 h-4 text-white/70" />,
                      label: 'Total Applicants',
                      value: jobs.reduce((sum, j) => sum + (j._count?.applications ?? 0), 0),
                    },
                    {
                      icon: <Star className="w-4 h-4 text-white/70" />,
                      label: 'Your Avg Match',
                      value: yourAverage !== null ? `${yourAverage}%` : '—',
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {stat.icon}
                        <span className="text-xs text-white/70">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Trend line */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-[10px] text-white/40 mb-2">
                    Applicant Trend (Last 30 Days)
                  </p>
                  <svg viewBox="0 0 200 50" className="w-full h-10">
                    <polyline
                      points="0,40 30,35 60,28 90,32 120,20 150,15 180,10 200,8"
                      fill="none"
                      stroke="#00c896"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="200" cy="8" r="3" fill="#00c896" />
                  </svg>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-40">
                <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                  <div className="text-center flex flex-col items-center">
                    <Map className="w-8 h-8 text-blue-400" />
                    <p className="text-xs text-gray-400 mt-2">
                      {profile?.location ?? 'Location'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPublicProfilePage;