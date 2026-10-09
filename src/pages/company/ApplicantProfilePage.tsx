import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Copy,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useApplicantScores } from '../../hooks/useMatchScores';
import MatchBadge from '../../components/common/MatchBadge';
import ApplicantActions from '../../components/company/ApplicantActions';
import { getMatchStyle } from '../../utils/matchScore';
import { getStatusLabel } from '../../utils/applicationStatus';

interface ApplicantDocument {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
}

interface ApplicantDetail {
  id: string;
  status: string;
  appliedAt: string;
  coverNote: string | null;
  jobPosting: { id: string; title: string };
  student: {
    id: string;
    email: string;
    studentProfile: {
      firstName: string;
      lastName: string;
      phone: string | null;
      university: string | null;
      courseOfStudy: string | null;
      yearOfStudy: number | null;
      skills: string[];
      biography: string | null;
      avatarUrl: string | null;
      coverUrl: string | null;
      verificationStatus: string;
    } | null;
  };
  cv: ApplicantDocument | null;
  letter: ApplicantDocument | null;
}

const DocumentRow = ({ label, doc }: { label: string; doc: ApplicantDocument | null }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
      <FileText className="w-4 h-4 text-navy" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-navy">{label}</p>
      <p className="text-[11px] text-gray-400 truncate">
        {doc ? doc.fileName : 'The student has not uploaded this.'}
      </p>
    </div>
    {doc && (
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-semibold text-navy border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
        Open <ExternalLink className="w-3.5 h-3.5" />
      </a>
    )}
  </div>
);

const ApplicantProfilePage = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const companyName = user?.companyProfile?.companyName ?? 'our company';

  const [detail, setDetail] = useState<ApplicantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const getEntry = useApplicantScores(detail ? [detail.jobPosting.id] : []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get(`/applications/${applicationId}/applicant`);
        if (!cancelled) setDetail(res.data.data);
      } catch {
        if (!cancelled) setError('We could not load this applicant.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const handleStatus = async (status: string) => {
    if (!detail) return;
    try {
      setBusy(true);
      await api.patch(`/applications/${detail.id}/status`, { status });
      setDetail({ ...detail, status });
    } catch {
      alert('Failed to update status.');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(detail.student.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard can be blocked. The email is still shown on the page. */
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400">Loading applicant...</div>;
  }

  if (error || !detail) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <p className="text-gray-500 mb-4">{error || 'Applicant not found.'}</p>
        <Link to="/candidates" className="text-sm font-semibold text-navy underline">
          Back to candidates
        </Link>
      </div>
    );
  }

  const profile = detail.student.studentProfile;
  const fullName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || 'Student';
  const entry = getEntry(detail.id);
  const scoreStyle = entry.data ? getMatchStyle(entry.data.score) : null;

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <Link
        to={`/jobs/${detail.jobPosting.id}/applicants`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-navy transition-colors mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to applicants for {detail.jobPosting.title}
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              className="h-32"
              style={
                profile?.coverUrl
                  ? { backgroundImage: `url(${profile.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: 'linear-gradient(135deg, #1a2b4a 0%, #2d4270 50%, #00c896 100%)' }
              }
            />
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-10 mb-4">
                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-navy flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">{fullName.charAt(0)}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-navy">{fullName}</h1>
                {profile?.verificationStatus === 'VERIFIED' && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-dark bg-teal-light px-2 py-1 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified student
                  </span>
                )}
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {getStatusLabel(detail.status)}
                </span>
              </div>

              <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                <GraduationCap className="w-4 h-4" />
                {profile?.university ?? 'University not added'}
                {profile?.yearOfStudy ? ` • Year ${profile.yearOfStudy}` : ''}
                {profile?.courseOfStudy ? ` • ${profile.courseOfStudy}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${detail.student.email}`}
                  className="flex items-center gap-2 text-sm font-medium text-navy hover:underline">
                  <Mail className="w-4 h-4 text-gray-400" /> {detail.student.email}
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied' : 'Copy email'}
                </button>
                {profile?.phone && (
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" /> {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-navy mb-3">About</h2>
            <p className="text-sm text-gray-600 leading-6 whitespace-pre-line">
              {profile?.biography?.trim() || 'This student has not written an introduction yet.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-navy mb-3">Skills</h2>
            {(profile?.skills ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(profile?.skills ?? []).map((skill) => (
                  <span key={skill} className="bg-gray-100 text-navy text-xs font-medium px-3 py-1 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No skills added yet.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-navy mb-1">Cover note</h2>
            <p className="text-[11px] text-gray-400 mb-3">
              Applied on {new Date(detail.appliedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 leading-6 whitespace-pre-line">
              {detail.coverNote?.trim() || 'The student did not add a cover note.'}
            </p>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-navy mb-3">Decision</h2>
            <ApplicantActions
              status={detail.status}
              busy={busy}
              studentName={fullName}
              email={detail.student.email}
              jobTitle={detail.jobPosting.title}
              companyName={companyName}
              onChange={handleStatus}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-navy mb-3">Documents</h2>
            <div className="space-y-2">
              <DocumentRow label="CV" doc={detail.cv} />
              <DocumentRow label="Internship letter" doc={detail.letter} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-navy mb-3">Match for {detail.jobPosting.title}</h2>
            <div className="flex items-center gap-4 mb-3">
              <MatchBadge entry={entry} variant="ring" size={64} />
              {scoreStyle && (
                <span className={`text-xs font-bold ${scoreStyle.text}`}>
                  {scoreStyle.label.toUpperCase()}
                </span>
              )}
            </div>
            <div className={`${scoreStyle?.bg ?? 'bg-gray-50'} rounded-xl p-3`}>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfilePage;