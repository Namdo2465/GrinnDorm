import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { SquirrelIcon } from './SquirrelIcon';

interface AuthPageProps {
  onLogin: (email: string) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@grinnell.edu')) {
      setError('Please use your Grinnell College email address');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setStep('code');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setStep('success');

    setTimeout(() => {
      onLogin(email);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-grinnell-red-light to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SquirrelIcon className="w-16 h-16 text-grinnell-red" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GrinnDorm</h1>
          <p className="text-gray-600">Find your perfect home at Grinnell</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
                <p className="text-gray-600">Enter your Grinnell email to get started</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@grinnell.edu"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grinnell-red focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-grinnell-red text-white rounded-lg hover:bg-grinnell-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-600">We sent a 6-digit code to {email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grinnell-red focus:border-transparent text-center text-2xl tracking-widest"
                  required
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-grinnell-red text-white rounded-lg hover:bg-grinnell-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600">Taking you to your dorms...</p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Anonymous reviews • Verified Grinnell students only
        </p>
      </div>
    </div>
  );
}
