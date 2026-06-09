import React from 'react';
import {Link, Outlet, useLocation} from 'react-router-dom';

interface PeachLayoutProps {
  children?: React.ReactNode;
}

export function PeachLayout({children}: PeachLayoutProps) {
  const location = useLocation();
  const content = children || <Outlet />;

  return (
    <div className="min-h-screen flex flex-col" style={{
      backgroundColor: 'var(--color-l1-bg, #FFF8F0)',
      color: 'var(--color-text, #2D1B00)',
    }}>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b"
        style={{
          backgroundColor: 'rgba(255,248,240,0.95)',
          borderColor: 'var(--color-l5-border, #E8D8C8)',
        }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
                style={{backgroundColor: 'var(--color-primary, #FF8C42)'}}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xl font-black uppercase tracking-tight"
                style={{color: 'var(--color-text, #2D1B00)'}}>
                Peach
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login"
              className="text-white text-xs font-black uppercase px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] border-2"
              style={{
                backgroundColor: 'var(--color-primary, #FF8C42)',
                borderColor: 'var(--color-primary-dark, #E67320)',
              }}>
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{content}</main>

      <footer className="py-8 border-t"
        style={{borderColor: 'var(--color-l5-border, #E8D8C8)'}}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[0.625rem] font-black uppercase tracking-wider"
            style={{color: 'var(--color-text-muted, #9A8A80)'}}>
            Built with Peach CMS &middot; &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}