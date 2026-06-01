import {useState, useEffect} from 'react';
import {AdminStatsWire} from '@gustav/types';

import {userSdk} from '../sdk';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsWire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await userSdk.getAdminStats();
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch admin stats'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-gray-500 animate-pulse font-bold">
        Loading dashboard...
      </div>
    );
  if (error)
    return (
      <div className="text-rose-500 font-bold p-4 bg-rose-500/5 rounded-xl border border-rose-500/20">
        Error: {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Total Users
          </p>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {stats?.totalUsers}
          </p>
          <div className="mt-4 flex items-center text-emerald-500 text-xs font-bold">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            Active platform
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Active Sessions
          </p>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {stats?.activeSessions}
          </p>
          <div className="mt-4 flex items-center text-indigo-500 text-xs font-bold">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Real-time monitoring
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            System Status
          </p>
          <p className="text-4xl font-black text-emerald-500">
            {stats?.systemHealth}
          </p>
          <div className="mt-4 flex items-center text-emerald-500 text-xs font-bold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
            All systems operational
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={fetchStats}
            className="p-4 bg-gray-50 dark:bg-zinc-800/50 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all group border border-transparent hover:border-indigo-500/20"
          >
            <div className="font-bold text-sm">Refresh Stats</div>
            <div className="text-[10px] text-gray-400 font-medium group-hover:text-indigo-500/60 uppercase mt-1">
              Update live data
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
