import {useEffect} from 'react';
import {Link, Navigate} from 'react-router-dom';

import {Button} from './ui/Button';
import {useAuth} from './AuthContext';
import {Card, CardBody} from './ui/Card';

export function ProfilePage() {
  const {user, logout} = useAuth();

  useEffect(() => {
    document.title = 'Gustav - Profile';
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-screen min-h-screen bg-l1-bg dark:bg-dark-bg flex flex-col items-center justify-center p-4 ">
      <Card accent="primary" className="w-full max-w-md">
        <CardBody className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-layer-primary-light dark:bg-layer-primary/20 border-2 border-layer-primary/30 rounded-2xl flex items-center justify-center font-black text-2xl text-layer-primary ">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="layer-title text-2xl text-text dark:text-white mb-6">
            Welcome, {user.username}!
          </h1>
          <div className="space-y-3 mb-6 text-left bg-l1-bg/50 dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="layer-label text-text-muted dark:text-zinc-500">
                Email
              </span>
              <span className="text-sm font-bold text-text dark:text-zinc-300">
                {user.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="layer-label text-text-muted dark:text-zinc-500">
                Role
              </span>
              <span
                className={`text-sm font-black ${
                  user.isSuperAdmin ? 'text-danger' : 'text-layer-primary'
                }`}
              >
                {user.isSuperAdmin ? 'Administrator' : 'Standard User'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {user.isSuperAdmin && (
              <Link to="/admin/dashboard" className="block">
                <Button className="w-full" variant="primary" size="lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  Admin Control Panel
                </Button>
              </Link>
            )}
            <Button
              variant="danger"
              size="lg"
              className="w-full"
              onClick={logout}
            >
              Logout Session
            </Button>
          </div>
        </CardBody>
      </Card>
      <footer className="mt-6 text-text-muted dark:text-zinc-500 text-[0.625rem] font-black uppercase tracking-wider">
        Gustav Security &middot; v0.0.1
      </footer>
    </div>
  );
}
