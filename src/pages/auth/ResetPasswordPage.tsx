import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    try {
      setIsLoading(true);

      await api.post('/auth/reset-password', {
        token,
        password,
      });

      setSuccess(true);

      setTimeout(() => navigate('/student/login'), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? 'Failed to reset password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">U</span>
          </div>

          <h1 className="text-2xl font-bold text-navy mb-1">
            Reset Password
          </h1>

          <p className="text-gray-400 text-sm">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">

          {success ? (
            <div className="text-center">

              {/* Success Icon */}
              <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle
                  size={26}
                  className="text-teal"
                  strokeWidth={2}
                />
              </div>

              <p className="text-sm font-semibold text-navy mb-2">
                Password reset successfully!
              </p>

              <p className="text-xs text-gray-400 mb-4">
                Redirecting you to login in 3 seconds...
              </p>

              <Link
                to="/student/login"
                className="inline-flex items-center gap-1.5 text-teal text-sm font-semibold hover:underline"
              >
                Go to Login
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <>
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

              {/* Invalid Token Warning */}
              {!token && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-4">
                  <AlertCircle
                    size={18}
                    className="shrink-0 mt-0.5"
                  />

                  <span>
                    Invalid reset link. Please request a new one.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* New Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    New Password
                  </label>

                  <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">

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
                        <EyeOff size={18} strokeWidth={2} />
                      ) : (
                        <Eye size={18} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Confirm New Password
                  </label>

                  <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 bg-gray-50 focus-within:border-navy focus-within:bg-white transition-colors">

                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="flex-1 text-sm text-navy bg-transparent focus:outline-none"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                        <EyeOff size={18} strokeWidth={2} />
                      ) : (
                        <Eye size={18} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full bg-navy text-white font-semibold py-3.5 rounded-xl hover:bg-navy-light transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 'Set New Password'}
                </button>
              </form>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/student/login"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
