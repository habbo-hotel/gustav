import {useState, useEffect} from 'react';
import {UserSDK} from '@gustav/sdk';
import {AdminStatsWire} from '@gustav/types';

interface AdminPanelProps {
  userSdk: UserSDK;
}

export function AdminPanel({userSdk}: AdminPanelProps) {
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
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-gray-500 animate-pulse">Loading stats...</div>;
  if (error)
    return <div className="text-rose-500 font-medium">Error: {error}</div>;

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-zinc-700 pt-8 w-full">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center justify-center">
        <span className="bg-emerald-500/10 text-emerald-500 p-1.5 rounded-md mr-2">
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </span>
        Super Admin Control Panel
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700/50">
          <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            Total Users
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {stats?.totalUsers}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700/50">
          <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            Active Sessions
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {stats?.activeSessions}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700/50">
          <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            System Status
          </p>
          <p className="text-2xl font-black text-emerald-500">
            {stats?.systemHealth}
          </p>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={fetchStats}
          className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold py-2 rounded-lg transition-all"
        >
          Refresh Data
        </button>
        <button className="flex-1 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-sm font-bold py-2 rounded-lg transition-all">
          Manage Users
        </button>
      </div>
    </div>
  );
}
