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

  const brandColor = settings.primaryBrandColor || '#1e90ff';

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
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-1.5 ${
            isActive || isChildActive
              ? 'bg-opacity-10'
              : 'text-text-secondary dark:text-zinc-400 hover:bg-l1-bg dark:hover:bg-dark-hover'
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
                strokeWidth="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </Link>

        {hasChildren && activeDropdown === page.id && (
          <div className="absolute top-full left-0 pt-1 w-48 z-50">
            <div className="bg-white dark:bg-dark-card rounded-2xl border-2 border-l5-border dark:border-dark-border  py-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {children.map(child => (
                <Link
                  key={child.id}
                  to={child.path}
                  className={`block px-4 py-2.5 text-sm font-bold transition-colors ${
                    location.pathname === child.path
                      ? 'bg-layer-primary-light text-layer-primary'
                      : 'text-text-secondary dark:text-zinc-400 hover:bg-l1-bg dark:hover:bg-dark-hover hover:text-text dark:hover:text-white'
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
    <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border-b border-l5-border dark:border-dark-border ">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center  transition-transform hover:scale-105"
                style={{backgroundColor: brandColor}}
              >
                <img
                  src="/gustav.png"
                  alt="Gustav Logo"
                  className="w-10 h-10 object-contain brightness-0 invert"
                />
              </div>
              <span className="text-2xl font-black text-text dark:text-white uppercase tracking-tight ">
                {settings.siteName || 'Gustav'}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                  location.pathname === '/'
                    ? 'bg-opacity-10'
                    : 'text-text-secondary dark:text-zinc-400 hover:bg-l1-bg dark:hover:bg-dark-hover'
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

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.isSuperAdmin && (
                  <Link
                    to="/admin"
                    className="text-xs font-black uppercase transition-all hover:opacity-80 border-2 border-current px-4 py-2 rounded-xl "
                    style={{
                      color: brandColor,
                      borderColor: `${brandColor}40`,
                      backgroundColor: `${brandColor}10`,
                    }}
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/me"
                  className="w-10 h-10 bg-l1-bg dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border rounded-xl flex items-center justify-center font-black text-text-secondary dark:text-zinc-400  hover:scale-105 transition-all"
                >
                  {user.username.charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="text-white text-xs font-black uppercase px-6 py-3 rounded-xl  transition-all hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2"
                style={{
                  backgroundColor: brandColor,
                  borderColor: brandColor,
                }}
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

      <footer className="py-10 border-t border-l5-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[0.625rem] font-black text-text-muted dark:text-zinc-500 uppercase tracking-wider">
            Built with {settings.siteName || 'Gustav'} CMS &middot; &copy;{' '}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
