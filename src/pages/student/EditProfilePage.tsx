import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { clearMatchCache } from '../../services/matchScoreCache';

const EditProfilePage = () => {
  const { user, setAuth } = useAuth();
  const navigate = useNavigate();
  const profile = user?.studentProfile as any;

  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [university, setUniversity] = useState(profile?.university ?? '');
  const [courseOfStudy, setCourseOfStudy] = useState(profile?.courseOfStudy ?? '');
  const [yearOfStudy, setYearOfStudy] = useState(profile?.yearOfStudy?.toString() ?? '');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [biography, setBiography] = useState(profile?.biography ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '');
  const [coverUrl, setCoverUrl] = useState(profile?.coverUrl ?? '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const completion = () => {
    let score = 0;
    if (firstName) score += 20;
    if (university) score += 20;
    if (courseOfStudy) score += 20;
    if (skills.length > 0) score += 20;
    if (biography) score += 20;
    return score;
  };

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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'cover',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    try {
      if (type === 'avatar') setUploadingAvatar(true);
      else setUploadingCover(true);

      const url = await uploadImageToCloudinary(
        file,
        type === 'avatar' ? 'avatars' : 'covers',
      );

      if (type === 'avatar') setAvatarUrl(url);
      else setCoverUrl(url);

      // Save to backend immediately
      const response = await api.patch('/auth/profile', {
        ...(type === 'avatar' ? { avatarUrl: url } : { coverUrl: url }),
      });
      const updatedUser = response.data.data;
      const token = localStorage.getItem('token') ?? '';
      setAuth(updatedUser, token);
    } catch (err: any) {
      alert(err.message ?? 'Failed to upload image.');
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setIsLoading(true);
      const response = await api.patch('/auth/profile', {
        firstName,
        lastName,
        phone: phone || undefined,
        university: university || undefined,
        courseOfStudy: courseOfStudy || undefined,
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : undefined,
        skills,
        biography: biography || undefined,
      });
      const updatedUser = response.data.data;
      const token = localStorage.getItem('token') ?? '';
      setAuth(updatedUser, token);
      await api.delete('/auth/match-cache');
      clearMatchCache();
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const percent = completion();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-navy mb-1">Edit Profile</h1>
              <p className="text-sm text-gray-400">
                Update your information to enhance your internship matches.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                Completion
              </p>
              <p className="text-sm font-bold text-navy">{percent}% Profile Strength</p>
              <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-teal rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-teal-light border border-teal text-teal-dark text-sm px-4 py-3 rounded-xl mb-4">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">

              {/* Personal Information */}
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-navy text-sm">👤</span>
                  <h2 className="text-xs font-bold text-navy tracking-widest uppercase">
                    Personal Information
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-navy text-sm">🎓</span>
                  <h2 className="text-xs font-bold text-navy tracking-widest uppercase">
                    Academic Information
                  </h2>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    University / College
                  </label>
                  <input
                    type="text"
                    placeholder="University of Ghana"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Course / Major
                  </label>
                  <input
                    type="text"
                    placeholder="B.Sc. Computer Science"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                    value={courseOfStudy}
                    onChange={(e) => setCourseOfStudy(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Current Year
                    </label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors appearance-none"
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}>
                      <option value="">Select year</option>
                      {[1,2,3,4,5,6].map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      GPA / Grade
                    </label>
                    <input
                      type="text"
                      placeholder="3.8"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-navy text-sm">🎯</span>
                  <h2 className="text-xs font-bold text-navy tracking-widest uppercase">
                    Skills
                  </h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Add a skill and press Enter
                </p>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors mb-3">
                  <input
                    type="text"
                    placeholder="e.g. React, Python, UI Design"
                    className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                        setSkills([...skills, skillInput.trim()]);
                        setSkillInput('');
                      }
                    }}
                    className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center text-white text-lg hover:bg-navy-light transition-colors">
                    +
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1.5 bg-blue-50 text-navy text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-1">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Biography */}
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-navy text-sm">📄</span>
                  <h2 className="text-xs font-bold text-navy tracking-widest uppercase">
                    Biography
                  </h2>
                </div>
                <textarea
                  placeholder="Tell recruiters about yourself, your goals, and what makes you unique..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors resize-none"
                  rows={5}
                  maxLength={300}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {biography.length} / 300
                </p>
              </div>

              {/* Media */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-navy text-sm">🖼</span>
                  <h2 className="text-xs font-bold text-navy tracking-widest uppercase">
                    Media
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Profile Photo */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Profile Photo</p>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'avatar')}
                      />
                      <div className="border-2 border-dashed border-gray-200 rounded-xl aspect-square w-full flex flex-col items-center justify-center hover:border-navy transition-colors bg-gray-50 overflow-hidden relative">
                        {uploadingAvatar ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400">Uploading...</p>
                          </div>
                        ) : avatarUrl ? (
                          <>
                              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-xl" style={{ aspectRatio: '1/1' }} />                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-xs font-semibold">Change Photo</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl mb-2">📷</span>
                            <p className="text-xs text-gray-400">Click to upload photo</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Cover Photo */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Cover Photo</p>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'cover')}
                      />
                      <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex flex-col items-center justify-center hover:border-navy transition-colors bg-gray-50 overflow-hidden relative">
                        {uploadingCover ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400">Uploading...</p>
                          </div>
                        ) : coverUrl ? (
                          <>
                            <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-xs font-semibold">Change Cover</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl mb-2">🖼</span>
                            <p className="text-xs text-gray-400">Click to upload cover</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-navy text-white font-semibold py-4 rounded-xl hover:bg-navy-light transition-colors text-sm disabled:opacity-70 flex items-center justify-center gap-2 mb-3">
              <span>💾</span>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full text-gray-400 text-sm font-medium py-3 hover:text-navy transition-colors">
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;