import {useState, useEffect} from 'react';
import {Link, Navigate} from 'react-router-dom';

import {useAuth} from './AuthContext';

export function ProfilePage() {
  const {user, logout} = useAuth();

  useEffect(() => {
    document.title = 'Gustav - Profile';
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-screen min-h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200 dark:border-zinc-700">
        <h1 className="text-3xl font-black mb-4 text-gray-900 dark:text-white transition-colors tracking-tight">
          Welcome, {user.username}!
        </h1>
        <div className="space-y-3 mb-8 text-left bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700/50">
          <p className="text-gray-600 dark:text-zinc-400 text-sm font-medium">
            <span className="text-gray-400 dark:text-zinc-500 mr-2 uppercase text-[10px] font-bold">
              Email
            </span>
            {user.email}
          </p>
          <p className="text-gray-600 dark:text-zinc-400 text-sm font-medium">
            <span className="text-gray-400 dark:text-zinc-500 mr-2 uppercase text-[10px] font-bold">
              Role
            </span>
            <span
              className={
                user.isSuperAdmin
                  ? 'text-emerald-500 font-bold'
                  : 'text-indigo-500 font-bold'
              }
            >
              {user.isSuperAdmin ? 'Super Admin' : 'Standard User'}
            </span>
          </p>
        </div>

        <div className="space-y-3">
          {user.isSuperAdmin && (
            <Link
              to="/admin/dashboard"
              className="flex items-center justify-center space-x-2 w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-zinc-950/20"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span>Admin Control Panel</span>
            </Link>
          )}
          <button
            onClick={logout}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Logout Session
          </button>
        </div>
      </div>
      <footer className="mt-8 text-gray-400 dark:text-zinc-600 text-[10px] font-black uppercase tracking-widest">
        Gustav Security • v0.0.1
      </footer>
    </div>
  );
}
