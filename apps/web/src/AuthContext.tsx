import {AuthSDK} from '@gustav/sdk';
import {UserWire, RegisterInput} from '@gustav/types';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

const API_URL = 'http://localhost:3000/api';
const authSdk = new AuthSDK(API_URL);

interface AuthContextType {
  user: UserWire | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  loginWithDiscord: () => void;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [user, setUser] = useState<UserWire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const profile = await authSdk.me();
      if (profile && profile.id) {
        setUser(profile);
      }
    } catch {
      // Not authenticated
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      const profile = await authSdk.loginWithPassword(email, pass);
      setUser(profile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (data: RegisterInput) => {
    setError(null);
    try {
      await authSdk.register(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await authSdk.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const loginWithDiscord = () => {
    authSdk.loginWithDiscord();
  };

  if (isLoading) {
    return (
      <div className="w-screen min-h-screen bg-gray-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-zinc-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        loginWithDiscord,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
