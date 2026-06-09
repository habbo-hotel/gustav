import {Navigate, Outlet, Link, useLocation} from 'react-router-dom';
import {useAuth} from '../AuthContext';

export function AdminLayout() {
  const {user} = useAuth();
  const location = useLocation();

  if (!user || !user.isSuperAdmin) return <Navigate to="/" replace />;

  const navItems = [
    {
      label: 'Dashboard', path: '/admin/dashboard',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>),
    },
    {
      label: 'Users', path: '/admin/users',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
    },
    {
      label: 'Pages', path: '/admin/pages',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
    },
    {
      label: 'Schemas', path: '/admin/schemas',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7h16M4 12h16M4 17h10" /></svg>),
    },
    {
      label: 'Plugins', path: '/admin/plugins',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>),
    },
    {
      label: 'Themes', path: '/admin/themes',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>),
    },
  ];

  return (
    <div className="min-h-screen bg-l1-bg dark:bg-dark-bg flex">
      <aside className="w-64 flex flex-col bg-l2-sidebar dark:bg-dark-sidebar border-r border-l5-border dark:border-dark-border shrink-0">
        <div className="p-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-layer-primary rounded-xl flex items-center justify-center">
              <img src="/gustav.png" alt="Gustav" className="w-6 h-6 object-contain brightness-0 invert" />
            </div>
            <span className="text-lg font-black text-layer-primary-dark dark:text-l2-sidebar-active tracking-tight">Gustav</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-l2-sidebar-active text-l2-sidebar-active-text shadow-sm'
                    : 'text-l2-sidebar-text dark:text-dark-text hover:bg-white/50 dark:hover:bg-white/10'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-l5-border dark:border-dark-border">
          <Link to="/me" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-l2-sidebar-text dark:text-dark-text hover:bg-white/50 dark:hover:bg-white/10 transition-all">
            <div className="w-8 h-8 bg-layer-primary-light text-layer-primary rounded-lg flex items-center justify-center font-black text-xs">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{user.username}</div>
              <div className="text-[0.625rem] font-bold text-text-muted dark:text-dark-text-secondary uppercase tracking-wider">Admin</div>
            </div>
          </Link>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>
      <footer className="fixed bottom-0 right-0 left-64 py-3 px-6 text-center pointer-events-none">
        <p className="text-[0.625rem] font-bold text-text-muted dark:text-dark-text-secondary uppercase tracking-wider">Powered by Gustav CMS</p>
      </footer>
    </div>
  );
}
