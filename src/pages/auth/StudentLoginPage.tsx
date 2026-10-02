import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Rocket,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  Bot,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';

const StudentLoginPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      const { user, token } = await loginUser(
        email.trim(),
        password
      );

      if (user.role !== 'STUDENT') {
        setError('This account is not a student account.');
        return;
      }

      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex">

          {/* Left Panel */}
          <div className="hidden md:flex w-[45%] bg-navy p-12 flex-col justify-between">

            <div>
              <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide">
                #CAREERMOMENTUM
              </span>

              <h2 className="text-4xl font-bold text-white leading-tight mb-6">
                Empowering the next generation of leaders.
              </h2>

              <p className="text-white/60 text-sm leading-6">
                Join thousands of students securing internships at top-tier
                companies. Your career journey starts with a single click.
              </p>
            </div>

            <div className="space-y-4">

              {/* Internship Feed */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Rocket className="size-4 text-teal" />
                </div>

                <div>
                  <p className="text-white text-sm font-semibold">
                    Access your internship feed
                  </p>

                  <p className="text-white/50 text-xs mt-0.5">
                    Personalized matches based on your skills and major.
                  </p>
                </div>
              </div>

              {/* Track Applications */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ClipboardCheck className="size-4 text-teal" />
                </div>

                <div>
                  <p className="text-white text-sm font-semibold">
                    Track Applications
                  </p>

                  <p className="text-white/50 text-xs mt-0.5">
                    Real-time status updates on every role you've applied for.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 p-10 flex flex-col justify-center">

            {/* Portal Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
                <GraduationCap className="size-4 text-white" />
              </div>

              <span className="text-xs font-bold text-navy tracking-widest uppercase">
                Student Portal
              </span>
            </div>

            <h1 className="text-3xl font-bold text-navy mb-1">
              Student Login
            </h1>

            <p className="text-gray-500 text-sm mb-8">
              Welcome back! Please enter your details.
            </p>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                <AlertCircle
                  size={18}
                  className="shrink-0 mt-0.5"
                />

                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>

                <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">

                  <Mail
                    size={18}
                    className="text-gray-400 shrink-0"
                  />

                  <input
                    type="email"
                    placeholder="name@university.edu"
                    className="flex-1 bg-transparent text-sm text-navy focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">

                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-navy font-semibold hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">

                  <LockKeyhole
                    size={18}
                    className="text-gray-400 shrink-0"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent text-sm text-navy focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-navy transition-colors"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-gray-300 accent-navy"
                />

                <label
                  htmlFor="remember"
                  className="text-sm text-gray-500"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-navy text-white font-semibold py-3.5 rounded-xl hover:bg-navy-light transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />

              <span className="text-xs text-gray-400 font-medium tracking-wide">
                OR CONTINUE WITH
              </span>

              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google and LinkedIn */}
            {/* Kept exactly as your original version */}
            <div className="grid grid-cols-2 gap-3 mb-6">

              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-blue-500">
                  G
                </span>

                Google
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-blue-700">
                  in
                </span>

                LinkedIn
              </button>

            </div>

            {/* Sign Up */}
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}

              <Link
                to="/student/register"
                className="text-navy font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-12">

          {[
            {
              icon: ShieldCheck,
              label: 'Enterprise Secured',
            },
            {
              icon: GraduationCap,
              label: '150+ Uni Partners',
            },
            {
              icon: Bot,
              label: 'AI Matching Engine',
            },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-gray-400"
            >
              <Icon className="size-4 text-gray-400" />

              <span className="text-xs font-semibold tracking-wide uppercase">
                {label}
              </span>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default StudentLoginPage;
