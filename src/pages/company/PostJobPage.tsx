import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Image as ImageIcon, Calendar, Send } from 'lucide-react';
import api from '../../services/api';

const jobTypes = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'HYBRID'];
const durations = ['1 month', '2 months', '3 months', '4 months', '6 months', '12 months'];

const PostJobPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('FULL_TIME');
  const [isPaid, setIsPaid] = useState(true);
  const [stipend, setStipend] = useState('');
  const [duration, setDuration] = useState('');
  const [vacancies, setVacancies] = useState('1');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState('');
  const [academicRequirements, setAcademicRequirements] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title || !description) {
      setError('Job title and description are required.');
      return;
    }
    if (skills.length === 0) {
      setError('Please add at least one required skill.');
      return;
    }
    try {
      setIsLoading(true);
      const respArr = responsibilities
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      await api.post('/jobs', {
        title,
        description,
        skillsRequired: skills,
        responsibilities: respArr.length > 0 ? respArr : undefined,
        academicRequirements: academicRequirements || undefined,
        imageUrl: imageUrl || undefined,
        location: location || undefined,
        type,
        isPaid,
        stipend: isPaid && stipend ? parseFloat(stipend) : undefined,
        duration: duration || undefined,
        vacancies: parseInt(vacancies) || 1,
        deadline: deadline || undefined,
      });

      navigate('/listings');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to post internship.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">Post New Internship</h1>
          <p className="text-sm text-gray-400">
            Create a compelling listing to attract top talent. Fields marked
            with an asterisk are required.
          </p>
        </div>
      </div>

      {error && (
        <div className={`border text-sm px-4 py-3 rounded-xl mb-6 ${
          error.includes('verified')
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {error.includes('verified') && <span className="font-bold">⚠️ Verification Required — </span>}
          {error}
          {error.includes('verified') && (
            <p className="mt-1 text-xs">
              Please contact the UniIntern admin team to verify your company account.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">

          {/* Section 1: Basic Information */}
          <div className="p-6 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <h2 className="text-lg font-bold text-navy">Basic Information</h2>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                placeholder="Senior Product Designer Intern"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Description *
              </label>
              <textarea
                placeholder="Describe the role, team, and expectations..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors resize-none"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Location
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-2 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Job Type
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 appearance-none"
                  value={type}
                  onChange={(e) => setType(e.target.value)}>
                  {jobTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Compensation */}
          <div className="p-6 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <h2 className="text-lg font-bold text-navy">Compensation & Details</h2>
            </div>

            {/* Paid Toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4 border border-gray-100 mb-4">
              <div>
                <p className="text-sm font-semibold text-navy">Paid Internship</p>
                <p className="text-xs text-gray-400">
                  Does this role offer monetary compensation?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaid(!isPaid)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isPaid ? 'bg-teal' : 'bg-gray-300'
                }`}>
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isPaid ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {isPaid && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Monthly Stipend
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 py-3 gap-2 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">
                    <span className="text-gray-400 text-sm font-bold">GH₵</span>
                    <input
                      type="number"
                      placeholder="4500"
                      className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Duration
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 appearance-none"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}>
                  <option value="">Select duration</option>
                  {durations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Vacancies
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="2"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                  value={vacancies}
                  onChange={(e) => setVacancies(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Requirements */}
          <div className="p-6 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <h2 className="text-lg font-bold text-navy">Requirements</h2>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Required Skills
              </label>
              <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors flex flex-wrap gap-2 items-center">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 bg-navy text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-300 transition-colors">
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Type and press enter..."
                  className="flex-1 min-w-[160px] text-sm text-navy bg-transparent focus:outline-none"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                />
              </div>
            </div>

            {/* Responsibilities */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Key Responsibilities (one per line)
              </label>
              <textarea
                placeholder="What will they be doing day-to-day?"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors resize-none"
                rows={4}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
              />
            </div>

            {/* Academic Requirements */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Academic Requirements
              </label>
              <textarea
                placeholder="e.g. Currently pursuing BS/MS in Computer Science or related field"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors resize-none"
                rows={3}
                value={academicRequirements}
                onChange={(e) => setAcademicRequirements(e.target.value)}
              />
            </div>
          </div>

          {/* Section 4: Media & Deadline */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <h2 className="text-lg font-bold text-navy">Media & Deadline</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Hero Image URL
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-2 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://..."
                    className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Application Deadline
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-2 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-navy text-white font-bold py-4 rounded-xl hover:bg-navy-light transition-colors text-sm disabled:opacity-70 flex items-center justify-center gap-2 mb-3">
          {isLoading ? (
            'Posting...'
          ) : (
            <>
              Post Internship
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate('/listings')}
          className="w-full text-gray-400 text-sm font-medium py-3 hover:text-navy transition-colors">
          Cancel
        </button>
      </form>
    </div>
  );
};

export default PostJobPage;