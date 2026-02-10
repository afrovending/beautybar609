import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, UserPlus, KeyRound, ArrowLeft, Mail } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminLogin = () => {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (view === 'login') {
        await login(email, password);
        navigate('/admin/dashboard');
      } else if (view === 'register') {
        await register(email, password, name);
        navigate('/admin/dashboard');
      } else if (view === 'forgot') {
        const response = await axios.post(`${API}/auth/forgot-password`, { email });
        setSuccess('If the email exists, reset instructions have been sent. Check console/logs for the reset token (in production, this would be emailed).');
        if (response.data.reset_token) {
          setResetToken(response.data.reset_token);
          setView('reset');
        }
      } else if (view === 'reset') {
        await axios.post(`${API}/auth/reset-password`, { token: resetToken, new_password: newPassword });
        setSuccess('Password reset successfully! You can now login.');
        setView('login');
        setResetToken('');
        setNewPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (view === 'forgot') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
              placeholder="Enter your email"
              required
              data-testid="forgot-email-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-400 text-obsidian font-bold uppercase tracking-wider py-4 hover:bg-gold-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="forgot-submit-btn"
          >
            {loading ? 'Please wait...' : (
              <>
                <Mail size={18} />
                Send Reset Link
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => { setView('login'); setError(''); setSuccess(''); }}
            className="w-full text-neutral-400 hover:text-gold-400 text-sm flex items-center justify-center gap-2 mt-4"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </form>
      );
    }

    if (view === 'reset') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Reset Token</label>
            <input
              type="text"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors font-mono text-sm"
              placeholder="Paste your reset token"
              required
              data-testid="reset-token-input"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors pr-12"
                placeholder="Enter new password"
                required
                data-testid="new-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-gold-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-400 text-obsidian font-bold uppercase tracking-wider py-4 hover:bg-gold-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="reset-submit-btn"
          >
            {loading ? 'Please wait...' : (
              <>
                <KeyRound size={18} />
                Reset Password
              </>
            )}
          </button>
        </form>
      );
    }

    // Login/Register form
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {view === 'register' && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
              placeholder="Your name"
              required={view === 'register'}
              data-testid="name-input"
            />
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
            placeholder="admin@beautybar609.com"
            required
            data-testid="email-input"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors pr-12"
              placeholder="••••••••"
              required
              data-testid="password-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-gold-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {view === 'login' && (
          <button
            type="button"
            onClick={() => { setView('forgot'); setError(''); }}
            className="text-gold-400 hover:text-gold-300 text-sm"
            data-testid="forgot-password-link"
          >
            Forgot password?
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-400 text-obsidian font-bold uppercase tracking-wider py-4 hover:bg-gold-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          data-testid="submit-btn"
        >
          {loading ? (
            'Please wait...'
          ) : view === 'login' ? (
            <>
              <LogIn size={18} />
              Login
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Create Account
            </>
          )}
        </button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-gold-400 mb-2">BeautyBar609</h1>
          <p className="text-neutral-400">Admin Panel</p>
        </div>

        <div className="bg-charcoal border border-white/10 p-8">
          {(view === 'login' || view === 'register') && (
            <div className="flex mb-6 border-b border-white/10">
              <button
                onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                className={`flex-1 pb-3 text-sm uppercase tracking-wider transition-colors ${
                  view === 'login' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-neutral-500'
                }`}
                data-testid="login-tab"
              >
                Login
              </button>
              <button
                onClick={() => { setView('register'); setError(''); setSuccess(''); }}
                className={`flex-1 pb-3 text-sm uppercase tracking-wider transition-colors ${
                  view === 'register' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-neutral-500'
                }`}
                data-testid="register-tab"
              >
                Register
              </button>
            </div>
          )}

          {(view === 'forgot' || view === 'reset') && (
            <div className="mb-6 pb-3 border-b border-white/10">
              <h2 className="text-gold-400 text-lg font-medium flex items-center gap-2">
                <KeyRound size={20} />
                {view === 'forgot' ? 'Forgot Password' : 'Reset Password'}
              </h2>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 mb-4 text-sm" data-testid="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 mb-4 text-sm" data-testid="success-message">
              {success}
            </div>
          )}

          {renderForm()}
        </div>

        <p className="text-center mt-6 text-neutral-600 text-sm">
          <a href="/" className="text-gold-400 hover:text-gold-300">← Back to website</a>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
