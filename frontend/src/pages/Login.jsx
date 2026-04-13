import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      login(token, user);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-dark)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-sidebar)] rounded-xl border border-gray-800 shadow-2xl p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="42 Robotics" className="h-16 w-auto mx-auto mb-4 object-contain" />
          <p className="text-[var(--color-text-muted)]">Sign in to access the club platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full bg-[var(--color-panel)] border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., student name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full bg-[var(--color-panel)] border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold py-3 rounded-md transition-colors duration-200 mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-md hover:bg-gray-200 transition-colors duration-200"
            onClick={() => alert('This is a demo environment. OAuth is simulated. Please use the form above with demo credentials.')}
          >
            <span className="text-xl font-black tracking-tighter">42</span>
            <span>Sign in with 42</span>
          </button>
          
          <div className="mt-4 text-xs text-gray-500 space-y-2">
            <p className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse"></span>
              Demo Environment
            </p>
            <p>
              The actual platform is accessible exclusively to 42 Abu Dhabi students via standard intra OAuth. 
              <br />
              <span className="text-gray-400 mt-1 inline-block">Use demo accounts above for this preview: admin / ahmed (password: password)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
