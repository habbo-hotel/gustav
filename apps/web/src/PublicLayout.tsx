import React, {useState, useEffect} from 'react';
import {PageWire, PageStatus} from '@gustav/types';
import {Link, Outlet, useLocation} from 'react-router-dom';

import {pageSdk} from './sdk';
import {useAuth} from './AuthContext';

export function PublicLayout() {
  const [pages, setPages] = useState<PageWire[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const location = useLocation();
  const {user} = useAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [allPages, coreSettings] = await Promise.all([
          pageSdk.findAll(),
          pageSdk.getPluginSettings('@gustav/core-plugin'),
        ]);

        const published = allPages.filter(
          p => p.status === PageStatus.PUBLISHED
        );
        setPages(published);
        setSettings(coreSettings);
      } catch (err) {
        console.error('Failed to fetch initial public data', err);
      }
    };
    fetchInitialData();
  }, []);

  const brandColor = settings.primaryBrandColor || '#4f46e5';

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center space-x-3">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                style={{backgroundColor: brandColor}}
              >
                <img
                  src="/gustav.png"
                  alt="Gustav Logo"
                  className="w-12 h-12 object-contain brightness-0 invert"
                />
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                {settings.siteName || 'Gustav'}
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  location.pathname === '/'
                    ? 'bg-opacity-10'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
                style={
                  location.pathname === '/'
                    ? {
                        color: brandColor,
                        backgroundColor: `${brandColor}20`,
                      }
                    : {}
                }
              >
                Home
              </Link>
              {pages.map(page => (
                <Link
                  key={page.id}
                  to={page.path}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === page.path
                      ? 'bg-opacity-10'
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                  style={
                    location.pathname === page.path
                      ? {
                          color: brandColor,
                          backgroundColor: `${brandColor}20`,
                        }
                      : {}
                  }
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
                    className="text-xs font-black uppercase transition-colors mr-4 hover:opacity-80"
                    style={{color: brandColor}}
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
                className="text-white text-xs font-black uppercase px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{backgroundColor: brandColor}}
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
            Built with {settings.siteName || 'Gustav'} CMS • &copy;{' '}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
