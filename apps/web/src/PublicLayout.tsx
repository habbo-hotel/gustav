import React, {useState, useEffect} from 'react';
import {PageWire, PageStatus} from '@gustav/types';
import {Link, Outlet, useLocation} from 'react-router-dom';

import {pageSdk} from './sdk';
import {useAuth} from './AuthContext';

export function PublicLayout() {
  const [pages, setPages] = useState<PageWire[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
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
          p => p.status === PageStatus.PUBLISHED && p.showInNavigation
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

  const rootPages = pages.filter(p => !p.parentId && p.path !== '/');

  const NavItem = ({page}: {page: PageWire}) => {
    const children = pages.filter(p => p.parentId === page.id);
    const hasChildren = children.length > 0;
    const isActive = location.pathname === page.path;
    const isChildActive = children.some(c => location.pathname === c.path);

    return (
      <div
        className="relative group"
        onMouseEnter={() => hasChildren && setActiveDropdown(page.id)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <Link
          to={page.path}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1 ${
            isActive || isChildActive
              ? 'bg-opacity-10'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
          style={
            isActive || isChildActive
              ? {
                  color: brandColor,
                  backgroundColor: `${brandColor}20`,
                }
              : {}
          }
        >
          <span>{page.title}</span>
          {hasChildren && (
            <svg
              className={`w-4 h-4 transition-transform ${
                activeDropdown === page.id ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </Link>

        {hasChildren && activeDropdown === page.id && (
          <div className="absolute top-full left-0 pt-1 w-48 z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {children.map(child => (
                <Link
                  key={child.id}
                  to={child.path}
                  className={`block px-4 py-2 text-sm font-bold transition-colors ${
                    location.pathname === child.path
                      ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  style={
                    location.pathname === child.path ? {color: brandColor} : {}
                  }
                >
                  {child.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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
              {rootPages.map(page => (
                <NavItem key={page.id} page={page} />
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
