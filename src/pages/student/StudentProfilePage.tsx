import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Camera, 
  MapPin, 
  GraduationCap, 
  Share2, 
  MoreHorizontal, 
  BookOpen, 
  Pencil, 
  Code2, 
  Plus, 
  User, 
  Briefcase, 
  Target, 
  Target as CircleTarget, 
  FileText, 
  Mail, 
  Search, 
  ChevronRight 
} from 'lucide-react';

interface Document {
  id: string;
  type: 'CV' | 'LETTER';
  fileName: string;
  uploadedAt: string;
  verificationStatus?: string;
}

const ProfileCompletion = ({ percent }: { percent: number }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke="#00c896" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-navy">{percent}%</span>
      </div>
    </div>
  );
};

const StudentProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = user?.studentProfile as any;
  const [documents, setDocuments] = useState<Document[]>([]);

  const [experiences, setExperiences] = useState<{ title: string; description: string }[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    api.get('/documents').then((res) => setDocuments(res.data.data ?? []));
  }, []);

  const cvDoc = documents.find((d) => d.type === 'CV');
  const letterDoc = documents.find((d) => d.type === 'LETTER');

  const completion = () => {
    let score = 0;
    if (profile?.firstName) score += 20;
    if (profile?.university) score += 20;
    if (profile?.courseOfStudy) score += 20;
    if (profile?.skills?.length > 0) score += 20;
    if (profile?.biography) score += 20;
    return score;
  };
  const percent = completion();

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Main Column */}
            <div className="lg:col-span-2 space-y-4">

              {/* Profile Header Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Cover Photo */}
                <div
                  className="h-44 relative cursor-pointer"
                  style={
                    profile?.coverUrl
                      ? { backgroundImage: `url(${profile.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: 'linear-gradient(135deg, #1a2b4a 0%, #2d4270 50%, #00c896 100%)' }
                  }>
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* Avatar + Info */}
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-10 mb-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden" style={{ aspectRatio: '1/1' }}>
                        {profile?.avatarUrl ? (
                          <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-navy text-2xl font-bold">
                              {profile?.firstName?.charAt(0) ?? 'S'}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => navigate('/profile/edit')}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-navy rounded-full flex items-center justify-center border-2 border-white">
                        <Camera className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-navy">
                          {profile?.firstName} {profile?.lastName}
                        </h1>
                        {profile?.verificationStatus === 'VERIFIED' && (
                          <span className="border border-teal text-teal text-xs font-semibold px-3 py-1 rounded-full">
                            Verified Student
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                        {profile?.university && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {profile.university}
                          </span>
                        )}
                        {profile?.courseOfStudy && (
                          <>
                            <span className="text-gray-200">•</span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" /> {profile.courseOfStudy}
                            </span>
                          </>
                        )}
                        {profile?.yearOfStudy && (
                          <>
                            <span className="text-gray-200">•</span>
                            <span>Year {profile.yearOfStudy}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button className="flex items-center gap-2 bg-navy text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-navy-light transition-colors">
                        <Share2 className="w-3.5 h-3.5" /> Share Profile
                      </button>
                      <button className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic + Skills Grid */}
              <div className="grid md:grid-cols-2 gap-4">

                {/* Academic Overview */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-navy" />
                      <h2 className="text-base font-bold text-navy">Academic Overview</h2>
                    </div>
                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="text-gray-300 hover:text-navy transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                        Current GPA
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-navy">
                          —<span className="text-sm text-gray-400 font-normal">/4.0</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                        Major
                      </p>
                      <p className="text-sm font-semibold text-navy">
                        {profile?.courseOfStudy ?? 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                        Expected Graduation
                      </p>
                      <p className="text-sm font-semibold text-navy">
                        {profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-navy" />
                      <h2 className="text-base font-bold text-navy">Technical Skills</h2>
                    </div>
                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="text-gray-300 hover:text-navy transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Core Competencies
                    </p>
                    {profile?.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="bg-gray-100 text-navy text-xs font-medium px-3 py-1 rounded-lg">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate('/profile/edit')}
                        className="text-xs text-teal font-semibold hover:underline">
                        + Add skills
                      </button>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Languages
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-navy">English (Native)</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="w-2.5 h-2.5 rounded-full bg-teal" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Me */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-navy" />
                    <h2 className="text-base font-bold text-navy">About Me</h2>
                  </div>
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="text-gray-300 hover:text-navy transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                {profile?.biography ? (
                  <p className="text-sm text-gray-500 leading-6">{profile.biography}</p>
                ) : (
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="text-xs text-teal font-semibold hover:underline">
                    + Add a biography
                  </button>
                )}
              </div>

              {/* Experience & Interests */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-navy" />
                      <h3 className="text-sm font-bold text-navy">Experience & Projects</h3>
                    </div>
                    <button
                      onClick={() => setShowExpModal(true)}
                      className="text-gray-300 hover:text-navy transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {experiences.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400 mb-3 leading-5">
                        Showcase your past roles, hackathons, or personal projects.
                      </p>
                      <button
                        onClick={() => setShowExpModal(true)}
                        className="flex items-center gap-1.5 text-xs text-teal font-semibold mx-auto hover:underline">
                        <Plus className="w-4 h-4" /> Add Entry
                      </button>
                    </div>
                    ) : (
                      <div className="space-y-3">
                        {experiences.map((exp, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs font-bold text-navy">{exp.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{exp.description}</p>
                          </div>
                        ))}
                        <button
                          onClick={() => setShowExpModal(true)}
                          className="flex items-center gap-1 text-xs text-teal font-semibold hover:underline">
                          <Plus className="w-3 h-3" /> Add another
                        </button>
                      </div>
                    )}
                  </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-teal" />
                      <h3 className="text-sm font-bold text-navy">Internship Interests</h3>
                    </div>
                    <button
                      onClick={() => setShowInterestModal(true)}
                      className="text-gray-300 hover:text-navy transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {interests.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400 mb-3 leading-5">
                        Let recruiters know what roles and industries you're targeting.
                      </p>
                      <button
                        onClick={() => setShowInterestModal(true)}
                        className="flex items-center gap-1.5 text-xs text-teal font-semibold mx-auto hover:underline">
                        <Plus className="w-4 h-4" /> Add Interests
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest, i) => (
                        <span key={i} className="bg-teal-light text-teal-dark text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                          {interest}
                          <button
                            onClick={() => setInterests(interests.filter((_, idx) => idx !== i))}
                            className="hover:text-red-500 transition-colors ml-1">
                            ×
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={() => setShowInterestModal(true)}
                        className="text-xs text-teal font-semibold hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add more
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">

              {/* Profile Completion */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CircleTarget className="w-4 h-4 text-teal" />
                  <h2 className="text-base font-bold text-navy">Profile Completion</h2>
                </div>
                <ProfileCompletion percent={percent} />
                <p className="text-xs text-gray-400 text-center mt-3 leading-5">
                  You're almost there! Add{' '}
                  <span className="font-bold text-navy">Experience</span> and{' '}
                  <span className="font-bold text-navy">Interests</span> to reach
                  100% and stand out to recruiters.
                </p>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-navy" />
                    <h2 className="text-sm font-bold text-navy">Documents</h2>
                  </div>
                  <button
                    onClick={() => navigate('/documents')}
                    className="text-gray-300 hover:text-navy transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {cvDoc ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-red-500 text-xs font-bold">PDF</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-navy truncate">
                          {cvDoc.fileName}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block" />
                          Updated {new Date(cvDoc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/documents')}
                      className="w-full text-xs text-teal font-semibold hover:underline text-left p-2">
                      + Upload CV
                    </button>
                  )}

                  {letterDoc ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-navy truncate">
                          {letterDoc.fileName}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block" />
                          Verified
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/documents')}
                      className="w-full text-xs text-teal font-semibold hover:underline text-left p-2">
                      + Upload Endorsement Letter
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                  Quick Actions
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Pencil className="w-4 h-4 text-navy" />
                      <span className="text-sm font-medium text-navy">Edit Profile Details</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-navy transition-colors" />
                  </button>
                  <button
                    onClick={() => navigate('/documents')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-navy" />
                      <span className="text-sm font-medium text-navy">Upload Documents</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-navy transition-colors" />
                  </button>
                  <button
                    onClick={() => navigate('/feed')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-navy rounded-xl hover:bg-navy-light transition-colors group">
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-white" />
                      <span className="text-sm font-medium text-white">Browse Internships</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Experience Modal */}
      {showExpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-navy">Add Experience / Project</h2>
              <button onClick={() => setShowExpModal(false)} className="text-gray-400 hover:text-navy">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer Intern at XYZ"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                <textarea
                  placeholder="Briefly describe what you did..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 resize-none"
                  rows={3}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  if (expTitle.trim()) {
                    setExperiences([...experiences, { title: expTitle.trim(), description: expDesc.trim() }]);
                    setExpTitle('');
                    setExpDesc('');
                    setShowExpModal(false);
                  }
                }}
                className="w-full bg-navy text-white font-semibold py-3 rounded-xl hover:bg-navy-light transition-colors text-sm">
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interests Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-navy">Add Internship Interests</h2>
              <button onClick={() => setShowInterestModal(false)} className="text-gray-400 hover:text-navy">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Interest (press Enter to add)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Software Engineering, Fintech"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && interestInput.trim()) {
                        setInterests([...interests, interestInput.trim()]);
                        setInterestInput('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (interestInput.trim()) {
                        setInterests([...interests, interestInput.trim()]);
                        setInterestInput('');
                      }
                    }}
                    className="bg-navy text-white px-4 rounded-xl hover:bg-navy-light transition-colors">
                    +
                  </button>
                </div>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, i) => (
                    <span key={i} className="bg-teal-light text-teal-dark text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      {interest}
                      <button onClick={() => setInterests(interests.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowInterestModal(false)}
                className="w-full bg-navy text-white font-semibold py-3 rounded-xl hover:bg-navy-light transition-colors text-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;