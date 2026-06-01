import {Navigate, Outlet, Link, useLocation} from 'react-router-dom';

import {useAuth} from '../AuthContext';

export function AdminLayout() {
  const {user} = useAuth();
  const location = useLocation();

  if (!user || !user.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
                G
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Gustav Admin
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {user.username}
              </span>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                Super Admin
              </span>
            </div>
            <Link
              to="/me"
              className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-sm border border-indigo-500/20 hover:scale-105 transition-transform"
            >
              {user.username.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full px-6 py-8">
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      <footer className="w-full py-6 px-6 border-t border-gray-200 dark:border-zinc-800 text-center">
        <p className="text-[10px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
          Gustav Infrastructure Management • Secure Environment
        </p>
      </footer>
    </div>
  );
}
