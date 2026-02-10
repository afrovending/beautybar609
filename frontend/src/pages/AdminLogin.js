import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

const AdminLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
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
          <div className="flex mb-6 border-b border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-3 text-sm uppercase tracking-wider transition-colors ${
                isLogin ? 'text-gold-400 border-b-2 border-gold-400' : 'text-neutral-500'
              }`}
              data-testid="login-tab"
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-3 text-sm uppercase tracking-wider transition-colors ${
                !isLogin ? 'text-gold-400 border-b-2 border-gold-400' : 'text-neutral-500'
              }`}
              data-testid="register-tab"
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 mb-4 text-sm" data-testid="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                  placeholder="Your name"
                  required={!isLogin}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-400 text-obsidian font-bold uppercase tracking-wider py-4 hover:bg-gold-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="submit-btn"
            >
              {loading ? (
                'Please wait...'
              ) : isLogin ? (
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
        </div>

        <p className="text-center mt-6 text-neutral-600 text-sm">
          <a href="/" className="text-gold-400 hover:text-gold-300">← Back to website</a>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
