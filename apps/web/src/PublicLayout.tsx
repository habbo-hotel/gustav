import React, {useState, useEffect} from 'react';
import {Link, Outlet, useLocation} from 'react-router-dom';
import {PageWire, PageStatus} from '@gustav/types';
import {pageSdk} from './sdk';
import {useAuth} from './AuthContext';

export function PublicLayout() {
  const [pages, setPages] = useState<PageWire[]>([]);
  const location = useLocation();
  const {user} = useAuth();

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const allPages = await pageSdk.findAll();
        // Only show published pages in the main nav
        const published = allPages.filter(p => p.status === PageStatus.PUBLISHED);
        setPages(published);
      } catch (err) {
        console.error('Failed to fetch nav pages', err);
      }
    };
    fetchPages();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                G
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Gustav
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  location.pathname === '/' 
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                Home
              </Link>
              {pages.map(page => (
                <Link
                  key={page.id}
                  to={page.path}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === page.path 
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' 
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {page.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.isSuperAdmin && (
                  <Link
                    to="/admin"
                    className="text-xs font-black uppercase text-indigo-500 hover:text-indigo-600 transition-colors mr-4"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/me"
                  className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:scale-105 transition-all"
                >
                  {user.username.charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-xs font-black uppercase px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="py-12 border-t border-gray-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
            Built with Gustav CMS • &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
