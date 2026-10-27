import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle,
  KeyRound,
  Info
} from 'lucide-react';
import Button from '../components/Button';
import FormField from '../components/FormField';
import { adminLogin } from '../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/admin/applications';

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('AdminPass@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await adminLogin(username.trim(), password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid username or password.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Failed to authenticate with backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Top Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Citizen Portal</span>
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-navy-800 text-teal-300 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
              Admin Login
            </h1>
            <p className="text-xs text-slate-500">
              Sign in to manage applications and issue digital certificates.
            </p>
          </div>

          {/* Demo Credentials Quick-Fill Pill */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <span>Admin: <strong className="font-mono">admin</strong></span>
                <span className="mx-1.5">•</span>
                <span>Password: <strong className="font-mono">AdminPass@123</strong></span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="font-semibold text-teal-700 hover:text-teal-900 underline text-xs ml-2 shrink-0"
            >
              Auto-Fill
            </button>
          </div>

          {/* Form Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Username" id="username" required>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter admin username"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 bg-white"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </FormField>

            <FormField label="Password" id="password" required>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 bg-white"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FormField>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-semibold"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          {/* Security Disclaimer Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Client-side simulated demo authentication (sessionStorage). Does not replace production OAuth / JWT security.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
