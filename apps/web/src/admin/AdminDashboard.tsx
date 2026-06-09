import {useState, useEffect} from 'react';
import {AdminStatsWire} from '@gustav/types';
import {userSdk} from '../sdk';
import {Button} from '../ui/Button';
import {Card, CardBody} from '../ui/Card';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsWire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Gustav - Dashboard'; fetchStats(); }, []);

  const fetchStats = async () => {
    try { setLoading(true); const data = await userSdk.getAdminStats(); setStats(data); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to fetch admin stats'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center gap-3 text-text-secondary font-bold text-sm p-8"><div className="w-5 h-5 border-2 border-layer-primary border-t-transparent rounded-full animate-spin" />Loading dashboard...</div>;
  if (error) return <div className="bg-danger-light border border-danger/30 rounded-xl p-5 m-8"><p className="font-bold text-sm text-danger">{error}</p></div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, accent: 'primary' as const,
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
      badge: 'Active platform' },
    { label: 'Active Sessions', value: stats?.activeSessions ?? 0, accent: 'pink' as const,
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>),
      badge: 'Real-time monitoring' },
    { label: 'System Status', value: stats?.systemHealth ?? 'OK', accent: 'mint' as const,
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      badge: 'All systems operational' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="layer-title text-2xl text-text dark:text-white">Dashboard</h1>
        <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mt-1">Welcome back! Here's what's happening on your site.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map(stat => (
          <Card key={stat.label} accent={stat.accent}>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <span className="layer-label text-text-secondary">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${stat.accent === 'primary' ? 'bg-layer-primary-light text-layer-primary border-layer-primary/20' : stat.accent === 'pink' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success-light text-success border-success/20'}`}>{stat.icon}</div>
              </div>
              <p className="text-3xl font-black text-text dark:text-white">{stat.value}</p>
              <div className={`flex items-center gap-1.5 mt-2 text-[0.625rem] font-bold uppercase ${stat.accent === 'primary' ? 'text-layer-primary' : stat.accent === 'pink' ? 'text-danger' : 'text-success'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                {stat.badge}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <Card>
        <CardBody>
          <h2 className="layer-title text-lg text-text dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="secondary" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} onClick={fetchStats} className="w-full" size="sm">Refresh Stats</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
