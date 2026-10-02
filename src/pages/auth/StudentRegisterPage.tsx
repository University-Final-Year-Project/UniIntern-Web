import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  CheckCircle2,
  User,
  Mail,
  Lock,
  Info,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { registerStudent } from '../../services/authService';

const StudentRegisterPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setIsLoading(true);

      const parts = fullName.trim().split(' ');
      const firstName = parts[0] ?? '';
      const lastName = parts.slice(1).join(' ') ?? '';

      const { user, token } = await registerStudent(
        email.trim(),
        password,
        firstName,
        lastName,
      );

      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? 'Registration failed.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden md:flex w-[42%] bg-navy flex-col justify-between p-12">

        <div>
          {/* Logo */}
          <div className="bg-white rounded-2xl p-4 inline-flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>

            <span className="text-navy font-bold text-lg">
              UniIntern
            </span>
          </div>

          <p className="text-white/70 text-sm mb-8">
            Empowering your next career move.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              {
                icon: Bot,
                label: 'AI-Powered Matching',
              },
              {
                icon: MessageSquare,
                label: 'Direct Recruiter Lines',
              },
              {
                icon: CheckCircle2,
                label: 'Vetted Opportunities',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <item.icon className="size-4 text-white" />
                </div>

                <span className="text-white text-sm font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div>
          <p className="text-white/70 text-sm italic leading-6 mb-4">
            "UniIntern helped me land my dream internship at a top tech firm
            within weeks of joining. The direct access to recruiters is a
            game-changer."
          </p>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                S
              </span>
            </div>

            <div>
              <p className="text-white text-sm font-semibold">
                Sarah Chen
              </p>

              <p className="text-white/50 text-xs">
                Computer Science Student
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">

          {/* Page Header */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-navy">
              Create Student Account
            </p>

            <p className="text-sm text-gray-400">
              Step 1 of 2: Basic Information
            </p>
          </div>

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

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>

              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">

                <User
                  className="size-4 text-gray-400 shrink-0"
                />

                <input
                  type="text"
                  placeholder="Alex Rivers"
                  className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* University Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                University Email
              </label>

              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">

                <Mail
                  className="size-4 text-gray-400 shrink-0"
                />

                <input
                  type="email"
                  placeholder="alex@university.edu"
                  className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Create Password
              </label>

              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">

                <Lock
                  className="size-4 text-gray-400 shrink-0"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
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

            {/* OTP Info */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">

              <Info
                className="size-4 text-blue-500 shrink-0 mt-0.5"
              />

              <p className="text-sm text-gray-600 leading-5">
                Next Step: A 6-digit OTP verification code will be sent to your
                email.
              </p>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-navy text-white font-bold py-4 rounded-xl hover:bg-navy-light transition-colors text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed uppercase flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />

                  <span>
                    Creating Account...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Create Student Account
                  </span>

                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}

            <Link
              to="/student/login"
              className="inline-flex items-center gap-1 text-navy font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default StudentRegisterPage;
