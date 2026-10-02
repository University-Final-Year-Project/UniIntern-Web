import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Zap, 
  ArrowRight, 
  Loader2, 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';

const CompanyLoginPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      setIsLoading(true);
      const { user, token } = await loginUser(email.trim(), password);
      if (user.role !== 'COMPANY') {
        setError('This account is not a company account.');
        return;
      }
      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">

        {/* Left Panel */}
        <div className="hidden md:flex w-[55%] bg-navy flex-col justify-between p-12">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-20">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="size-5 text-white" />
              </div>
              <span className="text-white font-bold text-sm tracking-widest uppercase">
                UniIntern Corporate
              </span>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-6">
              Scale your team with precision.
            </h2>
            <p className="text-white/60 text-sm leading-6 mb-10 max-w-sm">
              Access our network of 50,000+ vetted students. Manage your
              listings, track applicants in real-time, and build your future
              workforce.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, label: 'Secure Portal' },
                { icon: BarChart3, label: 'ATS Integration' },
                { icon: Users, label: 'Bulk Sourcing' },
                { icon: Zap, label: 'Instant Matching' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon className="size-4 text-white/80 shrink-0" />
                  <span className="text-white text-sm font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['A', 'B', 'C'].map((l) => (
                <div
                  key={l}
                  className="w-9 h-9 rounded-full bg-white/20 border-2 border-navy flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{l}</span>
                </div>
              ))}
            </div>
            <p className="text-white/60 text-sm">
              Joined by 200+ Global Enterprises this month
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex items-center justify-center px-10 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-navy leading-tight mb-2">
              Company Portal Login
            </h1>
            <p className="text-gray-400 text-sm mb-10">
              Secure access to your recruitment dashboard.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Corporate Email
                  </label>
                  <span className="text-gray-400 text-sm">@</span>
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-navy focus:outline-none focus:border-navy transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-navy font-semibold hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3.5 gap-3 focus-within:border-navy transition-colors">
                  <input
                    type= "password"
                    placeholder="••••••••"
                    className="flex-1 text-sm text-navy focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-gray-300 accent-navy"
                />
                <label htmlFor="remember" className="text-sm text-gray-500">
                  Keep me logged in for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-navy text-white font-semibold py-4 rounded-xl hover:bg-navy-light transition-colors text-sm disabled:opacity-70 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="h-px bg-gray-100 my-8" />

            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">
                Don't have a corporate account yet?
              </p>
              <Link
                to="/company/register"
                className="text-navy font-semibold text-sm hover:underline inline-flex items-center gap-1 group"
              >
                <span>Register your company</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <p className="text-center text-xs text-gray-300 mt-8 tracking-wide uppercase">
              Enterprise Grade Security • ISO 27001 Certified
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 py-4 px-8 flex items-center justify-between bg-white">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            <span className="text-xs text-gray-400">Systems Operational</span>
          </div>
          <a href="#" className="text-xs text-gray-400 hover:text-navy transition-colors">
            Legal & Privacy
          </a>
        </div>
        <p className="text-xs text-gray-400">© 2024 UniIntern Systems</p>
      </div>
    </div>
  );
};

export default CompanyLoginPage;