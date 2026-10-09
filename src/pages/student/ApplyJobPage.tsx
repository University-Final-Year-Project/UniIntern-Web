import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Rocket,
  FileText,
  UploadCloud,
  GraduationCap,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Zap,
  Check,
  Target,
  Info,
  Send,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import { type Job } from '../../types';
import { useJobScores } from '../../hooks/useMatchScores';
import MatchBadge from '../../components/common/MatchBadge';
import { getMatchStyle } from '../../utils/matchScore';


interface Document {
  id: string;
  type: 'CV' | 'LETTER';
  fileName: string;
}

const ApplyJobPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [coverNote, setCoverNote] = useState('');
  const [keyBullets, setKeyBullets] = useState('');
  const [aiDraft, setAiDraft] = useState('');

  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Same score the feed, dashboard and job page show for this job.
  const getScore = useJobScores(jobId ? [jobId] : []);
  const matchEntry = jobId ? getScore(jobId) : { status: 'idle' as const };
  const match = matchEntry.data;

  const cvInputRef = useRef<HTMLInputElement | null>(null);
  const letterInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobRes, docsRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get('/documents'),
        ]);

        setJob(jobRes.data.data);
        setDocuments(docsRes.data.data ?? []);
      } catch {
        navigate('/feed');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) loadData();
  }, [jobId, navigate]);

  const cvDoc = documents.find((d) => d.type === 'CV');
  const letterDoc = documents.find((d) => d.type === 'LETTER');

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'CV' | 'LETTER') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      setError('');
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newDoc = response.data.data;
      setDocuments((prev) => [...prev.filter((d) => d.type !== type), newDoc]);
    } catch (err: any) {
      setError(err.response?.data?.message ?? `Failed to upload ${type}.`);
    } finally {
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId: string, type: 'CV' | 'LETTER') => {
    try {
      setError('');
      await api.delete(`/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? `Failed to remove ${type}.`);
    }
  };

  const handleDraftWithAI = async () => {
    if (!keyBullets.trim()) return;
    setIsDraftingAI(true);
    try {
      const response = await api.post('/ai/draft-cover-letter', {
        jobTitle: job?.title,
        companyName: job?.company.companyProfile?.companyName,
        keyBullets,
      });

      if (response?.data?.data?.draft) {
        setAiDraft(response.data.data.draft);
      }
    } catch {
      setAiDraft(
        `Dear Hiring Team at ${job?.company.companyProfile?.companyName || 'the company'},\n\nI am excited to apply for the ${job?.title} position.\n\n${keyBullets}\n\nI believe my background aligns well with your requirements and I would love the opportunity to contribute to your team.\n\nBest regards`
      );
    } finally {
      setIsDraftingAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!cvDoc) {
      setError('Please upload your CV before submitting.');
      return;
    }
    if (!letterDoc) {
      setError('Please upload your University Endorsement Letter before submitting.');
      return;
    }
    if (!confirmed) {
      setError('Please confirm that your documents are authentic.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await api.post('/applications', {
        jobPostingId: jobId,
        coverNote: coverNote.trim() || undefined,
      });
      navigate('/applications');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-navy font-semibold">Loading job details...</div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-56">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Main Column */}
            <div className="lg:col-span-2 space-y-5">

              {/* Job Header */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-2 right-4 opacity-10">
                  <Rocket className="w-24 h-24 text-navy" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-navy flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {job.company.companyProfile?.companyName?.charAt(0) ?? 'C'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal tracking-widest uppercase mb-1">
                      {job.company.companyProfile?.companyName}
                    </p>
                    <h1 className="text-3xl font-bold text-navy mb-2">
                      {job.title}
                    </h1>
                    <p className="text-sm text-gray-500 leading-6">
                      {job.description.substring(0, 180)}...
                    </p>
                  </div>
                </div>
              </div>

              {/* CV Upload */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-navy" />
                    <h2 className="text-base font-bold text-navy">CV (PDF)</h2>
                  </div>
                  <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Required
                  </span>
                </div>

                <input
                  type="file"
                  ref={cvInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'CV')}
                />

                {cvDoc ? (
                  <div className="flex items-center gap-3 bg-teal-light border border-teal rounded-xl p-4">
                    <FileText className="w-6 h-6 text-teal-dark flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{cvDoc.fileName}</p>
                      <p className="text-xs text-teal-dark">CV uploaded and ready ✓</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => cvInputRef.current?.click()}
                        className="text-xs text-navy font-semibold hover:underline">
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(cvDoc.id, 'CV')}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove document">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => cvInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center hover:border-navy transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      Click or drag to upload your CV
                    </p>
                    <p className="text-xs text-gray-300">PDF up to 5MB</p>
                  </div>
                )}
              </div>

              {/* Endorsement Letter Upload */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-navy" />
                    <h2 className="text-base font-bold text-navy">
                      University Endorsement Letter (PDF)
                    </h2>
                  </div>
                  <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Required
                  </span>
                </div>

                <input
                  type="file"
                  ref={letterInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'LETTER')}
                />

                {letterDoc ? (
                  <div className="flex items-center gap-3 bg-teal-light border border-teal rounded-xl p-4">
                    <CheckCircle2 className="w-6 h-6 text-teal-dark flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{letterDoc.fileName}</p>
                      <p className="text-xs text-teal-dark">Letter uploaded and ready ✓</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => letterInputRef.current?.click()}
                        className="text-xs text-navy font-semibold hover:underline">
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(letterDoc.id, 'LETTER')}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove document">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => letterInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center hover:border-navy transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      Click or drag to upload Endorsement Letter
                    </p>
                    <p className="text-xs text-gray-300">PDF up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Cover Note Input */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-navy" />
                  <h2 className="text-base font-bold text-navy">Cover Note</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Add a short personal message for the hiring team (Optional).
                </p>
                <textarea
                  placeholder="Briefly introduce yourself..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy resize-none bg-gray-50 focus:bg-white transition-colors"
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                />
              </div>

              {/* AI Draft Tool */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal" />
                    <h2 className="text-base font-bold text-navy">
                      AI-Enhanced Cover Letter Helper
                    </h2>
                  </div>
                  <button
                    onClick={handleDraftWithAI}
                    disabled={isDraftingAI || !keyBullets.trim()}
                    className="bg-navy text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-navy-light transition-colors disabled:opacity-50 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    {isDraftingAI ? 'Drafting...' : 'Draft with AI'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Your Key Achievements
                    </p>
                    <textarea
                      placeholder={'• 2 years experience with Node & React\n• Built UG student portal\n• Hackathon finalist'}
                      className="w-full border border-gray-200 rounded-xl px-3 py-3 text-xs text-gray-500 focus:outline-none focus:border-navy resize-none bg-gray-50 h-32"
                      value={keyBullets}
                      onChange={(e) => setKeyBullets(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Generated Output
                    </p>
                    <div className="border-l-4 border-teal bg-teal-light rounded-r-xl px-3 py-3 h-32 overflow-y-auto">
                      {aiDraft ? (
                        <p className="text-xs text-gray-600 leading-5 whitespace-pre-line">{aiDraft}</p>
                      ) : (
                        <p className="text-xs text-gray-400 italic leading-5">
                          Add bullet points and click "Draft with AI" to generate a draft...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {aiDraft && (
                  <button
                    onClick={() => setCoverNote(aiDraft)}
                    className="mt-3 text-xs text-teal font-semibold hover:underline">
                    ← Copy generated text to my cover note
                  </button>
                )}
              </div>

              {/* Confirmation Checkbox */}
              <div
                className="flex items-center gap-3 cursor-pointer py-2 select-none"
                onClick={() => setConfirmed(!confirmed)}>
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                    confirmed ? 'bg-navy border-navy' : 'border-gray-300'
                  }`}>
                  {confirmed && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className="text-sm text-gray-500">
                  I confirm all uploaded documents are authentic and accurate.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 max-w-xs">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <p>
                      Applications go directly to {job.company.companyProfile?.companyName} recruiters.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(-1)}
                      className="border border-gray-200 text-gray-500 text-sm font-medium px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-navy text-white font-semibold px-6 py-3 rounded-xl hover:bg-navy-light transition-colors text-sm disabled:opacity-70 flex items-center gap-2">
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {matchEntry.status !== 'error' && (
                <div className="bg-navy rounded-2xl p-6 text-center">
                  <p className="text-xs font-bold text-white/50 tracking-widest uppercase mb-4">
                    Match Score
                  </p>
                  <div className="flex flex-col items-center mb-4">
                    <MatchBadge entry={matchEntry} variant="ring" size={128} onDark />
                    {match && (
                      <span className="text-xs text-white/50 mt-2">
                        {getMatchStyle(match.score).label}
                        {match.source === 'FALLBACK' ? ' (estimated)' : ''}
                      </span>
                    )}
                  </div>

                  {match && (
                    <div className="space-y-3 text-left">
                      <div className="bg-white/10 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-3.5 h-3.5 text-teal" />
                          <p className="text-white text-xs font-bold">Skills Alignment</p>
                        </div>
                        <p className="text-white/60 text-xs leading-4">
                          {match.matchedSkills.length > 0
                            ? `You match: ${match.matchedSkills.join(', ')}`
                            : 'None of your listed skills match this job yet.'}
                          {match.missingSkills.length > 0 &&
                            ` Still to build: ${match.missingSkills.join(', ')}.`}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <GraduationCap className="w-3.5 h-3.5 text-teal" />
                          <p className="text-white text-xs font-bold">Educational Fit</p>
                        </div>
                        <p className="text-white/60 text-xs leading-4">{match.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobPage;