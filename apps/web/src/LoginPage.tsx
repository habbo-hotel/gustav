import {useState, useEffect} from 'react';
import {useAuth} from './AuthContext';
import {useNavigate, Link} from 'react-router-dom';

interface LoginPageProps {
  mode: 'login' | 'register';
}

export function LoginPage({mode}: LoginPageProps) {
  const {login, register, loginWithDiscord, error, setError} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const isRegistering = mode === 'register';

  useEffect(() => {
    setError(null);
  }, [mode, setError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/me');
    } catch (err: any) {
      // Error is handled by context
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({email, password, username});
      setError('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      // Error is handled by context
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-zinc-700">
        <h1 className="text-3xl font-black mb-8 text-center text-gray-900 dark:text-white tracking-tight">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h1>

        {error && (
          <div
            className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-lg mb-6 text-sm"
            role="alert"
          >
            <span className="block sm:inline font-medium">{error}</span>
          </div>
        )}

        <form
          onSubmit={isRegistering ? handleRegister : handleLogin}
          className="space-y-5"
        >
          {isRegistering && (
            <div>
              <label className="block text-gray-700 dark:text-zinc-300 text-sm font-bold mb-1.5 ml-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 text-sm font-bold mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 text-sm font-bold mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/20"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to={isRegistering ? '/login' : '/register'}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-bold transition-colors"
          >
            {isRegistering
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </Link>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-500 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={loginWithDiscord}
          className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
        >
          Login with Discord
        </button>
      </div>
      <footer className="mt-8 text-gray-400 dark:text-zinc-600 text-sm font-medium">
        Powered by Gustav
      </footer>
    </div>
  );
}
