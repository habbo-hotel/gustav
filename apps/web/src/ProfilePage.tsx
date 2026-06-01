import {useAuth} from './AuthContext';
import {UserSDK} from '@gustav/sdk';
import {AdminPanel} from './AdminPanel';
import {Navigate} from 'react-router-dom';

const API_URL = 'http://localhost:3000/api';
const userSdk = new UserSDK(API_URL);

export function ProfilePage() {
  const {user, logout} = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-screen min-h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-xl w-full max-w-md text-center border border-gray-200 dark:border-zinc-700">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white transition-colors">
          Welcome, {user.username}!
        </h1>
        <div className="space-y-3 mb-8 text-left">
          <p className="text-gray-600 dark:text-zinc-400">
            <span className="font-semibold text-gray-800 dark:text-zinc-200">
              Email:
            </span>{' '}
            {user.email}
          </p>
          <p className="text-gray-600 dark:text-zinc-400">
            <span className="font-semibold text-gray-800 dark:text-zinc-200">
              Account Type:
            </span>
            <span
              className={
                user.isSuperAdmin
                  ? 'text-emerald-500 font-bold ml-1'
                  : 'text-indigo-500 font-bold ml-1'
              }
            >
              {user.isSuperAdmin ? 'Super Admin' : 'Standard User'}
            </span>
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-500/20"
        >
          Logout
        </button>

        {user.isSuperAdmin && <AdminPanel userSdk={userSdk} />}
      </div>
      <footer className="mt-8 text-gray-400 dark:text-zinc-600 text-sm font-medium">
        Powered by Gustav
      </footer>
    </div>
  );
}
