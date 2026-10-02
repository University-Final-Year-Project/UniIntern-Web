import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      setResetUrl(res.data.data.resetUrl);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to generate reset link.');
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
          <h1 className="text-2xl font-bold text-navy mb-1">Forgot Password</h1>
          <p className="text-gray-400 text-sm">
            Enter your email to reset your password
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {resetUrl ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-teal text-2xl">✓</span>
              </div>
              <p className="text-sm font-semibold text-navy mb-2">
                Reset link generated!
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Click the link below to reset your password:
              </p>
              <a
                href={resetUrl}
                className="block bg-teal-light text-teal-dark text-xs font-semibold px-4 py-3 rounded-xl break-all hover:bg-teal hover:text-white transition-colors mb-4">
                {resetUrl}
              </a>
              <p className="text-xs text-gray-400">
                This link expires in 1 hour.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@university.edu"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy bg-gray-50 focus:bg-white transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-navy text-white font-semibold py-3.5 rounded-xl hover:bg-navy-light transition-colors text-sm disabled:opacity-70">
                {isLoading ? 'Generating link...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/student/login"
              className="text-xs text-gray-400 hover:text-navy transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;