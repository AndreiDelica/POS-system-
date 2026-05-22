import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      login(data.token, data.user);
      
      if (data.user.role === 'ADMIN') navigate('/admin');
      else navigate('/branch');
      
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex justify-center w-20 h-20 bg-[#FFD300] rounded-full items-center shadow-lg border-4 border-white">
          <span className="text-4xl font-bold tracking-tighter text-black">D</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Delica's Worldwide
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium tracking-wide uppercase">
          Business Center System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="bg-[#FFD300]/20 text-[#8B0000] p-4 text-xs font-bold rounded flex justify-between items-center">
              <span>Admin: admin / admin123</span>
              <button 
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/auth/seed', { method: 'POST' });
                    alert(await res.text());
                  } catch(e) {}
                }} 
                className="underline hover:text-black">
                Seed DB
              </button>
            </div>
            {error && (
              <div className="bg-[#8B0000]/10 border border-[#8B0000]/20 rounded-md p-4">
                <p className="text-sm font-medium text-[#8B0000]">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1">
                <input
                  name="username"
                  type="text"
                  required
                  autoFocus
                  disabled={isLoading}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FFD300] focus:border-[#FFD300] sm:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FFD300] focus:border-[#FFD300] sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-black bg-[#FFD300] hover:bg-[#FFD300]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD300] transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
