import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfileStrength = ({ percent }: { percent: number }) => {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke="#00c896" strokeWidth="8"
          strokeDasharray={circ}
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

const CompanyProfilePage = () => {
  const { user, setAuth } = useAuth();
  const profile = user?.companyProfile;

  const [companyName, setCompanyName] = useState(profile?.companyName ?? '');
  const [industry, setIndustry] = useState(profile?.industry ?? '');
  const [description, setDescription] = useState(profile?.description ?? '');
  const [website, setWebsite] = useState(profile?.website ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [jobCount, setJobCount] = useState(0);
  const [totalApps, setTotalApps] = useState(0);

  useEffect(() => {
    api.get('/jobs/company/my-jobs').then((res) => {
      const jobs = res.data.data ?? [];
      setJobCount(jobs.length);
      setTotalApps(jobs.reduce((sum: number, j: any) => sum + j._count.applications, 0));
    });
  }, []);

  const completion = () => {
    let score = 0;
    if (companyName) score += 20;
    if (industry) score += 20;
    if (description) score += 20;
    if (website) score += 20;
    if (location) score += 20;
    return score;
  };

  const percent = completion();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setIsLoading(true);
      const res = await api.patch('/auth/company/profile', {
        companyName,
        industry: industry || undefined,
        description: description || undefined,
        website: website || undefined,
        location: location || undefined,
      });
      const updatedUser = res.data.data;
      const token = localStorage.getItem('token') ?? '';
      setAuth(updatedUser, token);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">

      {/* Cover Banner */}
      <div className="h-40 rounded-2xl bg-gradient-to-r from-navy to-navy-light relative overflow-hidden mb-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <button className="absolute top-4 right-4 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1.5">
          ✎ Edit Cover
        </button>
      </div>

      {/* Company Header */}
      <div className="flex items-end gap-5 -mt-8 mb-8 px-2">
        <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
          <span className="text-navy text-3xl font-bold">
            {companyName?.charAt(0) ?? 'C'}
          </span>
        </div>
        <div className="flex-1 pb-2">
          <h1 className="text-2xl font-bold text-navy">{companyName || 'Company Name'}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {industry && <span>🏢 {industry}</span>}
            {location && (
              <>
                <span>•</span>
                <span>📍 {location}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="mb-2 bg-navy text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-navy-light transition-colors flex items-center gap-2 disabled:opacity-70">
          ✎ {isLoading ? 'Saving...' : 'Edit Profile'}
        </button>
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
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* About Us */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold text-navy mb-4">About Us</h2>
              <textarea
                placeholder="Tell students about your company, culture, and internship program..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors resize-none"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold text-navy mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourcompany.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="careers@company.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                    value={email}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="Technology"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    HQ Address
                  </label>
                  <input
                    type="text"
                    placeholder="Accra, Ghana"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold text-navy mb-4">Social Links</h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 border border-gray-200 text-navy text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  🔗 LinkedIn
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 border border-gray-200 text-navy text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  🔗 Twitter
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-navy text-white font-semibold py-4 rounded-xl hover:bg-navy-light transition-colors text-sm disabled:opacity-70">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">

            {/* Profile Strength */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold text-navy mb-4">
                Profile Strength
              </h2>
              <ProfileStrength percent={percent} />
              <p className="text-xs text-gray-400 text-center mt-3 leading-5">
                {percent < 100
                  ? 'Almost complete! Add more details to reach 100%.'
                  : 'Your profile is complete!'}
              </p>
              {percent < 100 && (
                <button
                  type="button"
                  className="w-full mt-3 border border-gray-200 text-navy text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Complete Profile
                </button>
              )}
            </div>

            {/* Verification Status */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Verification Status
                </p>
                {profile?.verificationStatus === 'VERIFIED' ? (
                  <span className="bg-teal text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    ✓ VERIFIED
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded-full">
                    PENDING
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-navy">
                {profile?.verificationStatus === 'VERIFIED'
                  ? 'Identity Confirmed'
                  : 'Awaiting Verification'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {profile?.verificationStatus === 'VERIFIED'
                  ? 'Your company has been verified by UniIntern.'
                  : 'Our team will review your account within 2-3 business days.'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
                Quick Stats
              </p>
              <div className="space-y-3">
                {[
                  { icon: '💼', label: 'Active Listings', value: jobCount },
                  { icon: '👥', label: 'Applications', value: totalApps.toLocaleString() },
                  {
                    icon: '📅',
                    label: 'Member Since',
                    value: new Date(user?.studentProfile as any ?? Date.now()).getFullYear() || '2024',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{stat.icon}</span>
                      <span className="text-xs text-gray-500">{stat.label}</span>
                    </div>
                    <span className="text-sm font-bold text-navy">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfilePage;