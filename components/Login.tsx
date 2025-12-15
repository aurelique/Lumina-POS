import React, { useState, useEffect } from 'react';
import { Lock, User, Loader2, AlertCircle, Info } from 'lucide-react';
import { db } from './services/db';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check if script URL is set to determine if we are in "Initial Setup" mode
    const url = localStorage.getItem('lumina_gscript_url');
    setIsOffline(!url);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await db.login(username, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa username/password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300 border dark:border-gray-700">
        <div className="bg-indigo-600 p-8 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">BySha POS</h1>
          <p className="text-indigo-200 mt-2 text-sm">Masuk untuk mengelola toko</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                placeholder={isOffline ? "admin" : "Username"}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm justify-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
              <AlertCircle size={16}/> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>


        <div className="bg-gray-50 dark:bg-gray-900 p-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
          Versi 1.1 - Database Google Sheets
        </div>
      </div>
    </div>
  );
};