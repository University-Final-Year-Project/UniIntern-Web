import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const jobTypes = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'HYBRID'];

const EditJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    api.get(`/jobs/${jobId}`).then((res) => {
      const job = res.data.data;
      setTitle(job.title);
      setDescription(job.description);
      setLocation(job.location ?? '');
      setType(job.type);
      setIsPaid(job.isPaid);
      setStipend(job.stipend?.toString() ?? '');
      setDuration(job.duration ?? '');
      setVacancies(job.vacancies?.toString() ?? '1');
      setSkills(job.skillsRequired ?? []);
      setResponsibilities((job.responsibilities ?? []).join('\n'));
      setAcademicRequirements(job.academicRequirements ?? '');
      setImageUrl(job.imageUrl ?? '');
      setDeadline(job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '');
    }).finally(() => setIsLoading(false));
  }, [jobId]);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setIsSaving(true);
      const respArr = responsibilities.split('\n').map((r) => r.trim()).filter(Boolean);
      await api.patch(`/jobs/${jobId}`, {
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
      setError(err.response?.data?.message ?? 'Failed to update job.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">✎</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">Edit Internship</h1>
          <p className="text-sm text-gray-400">Update your internship listing details.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Job Title</label>
              <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
              <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors resize-none" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Location</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Job Type</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 appearance-none" value={type} onChange={(e) => setType(e.target.value)}>
                  {jobTypes.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Stipend (GH₵)</label>
                <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors" value={stipend} onChange={(e) => setStipend(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Duration</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Vacancies</label>
                <input type="number" min="1" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors" value={vacancies} onChange={(e) => setVacancies(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Required Skills</label>
              <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors flex flex-wrap gap-2 items-center">
                {skills.map((skill) => (
                  <span key={skill} className="flex items-center gap-1.5 bg-navy text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    {skill}
                    <button type="button" onClick={() => setSkills(skills.filter((s) => s !== skill))} className="hover:text-red-300">×</button>
                  </span>
                ))}
                <input type="text" placeholder="Type and press enter..." className="flex-1 min-w-[160px] text-sm text-navy bg-transparent focus:outline-none" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Key Responsibilities (one per line)</label>
              <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors resize-none" rows={4} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Academic Requirements</label>
              <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors resize-none" rows={3} value={academicRequirements} onChange={(e) => setAcademicRequirements(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Hero Image URL</label>
                <input type="url" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Application Deadline</label>
                <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="w-full bg-navy text-white font-bold py-4 rounded-xl hover:bg-navy-light transition-colors text-sm disabled:opacity-70 mb-3">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" onClick={() => navigate('/listings')} className="w-full text-gray-400 text-sm font-medium py-3 hover:text-navy transition-colors">
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditJobPage;