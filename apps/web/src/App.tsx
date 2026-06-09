import {useEffect} from 'react';
import {Toaster} from 'react-hot-toast';
import {ThemeProvider} from '@emotion/react';
import {BrowserRouter, Routes, Route, Navigate, Link} from 'react-router-dom';

import {theme} from './theme';
import {useAuth} from './AuthContext';
import {LoginPage} from './LoginPage';
import {ProfilePage} from './ProfilePage';
import {PageRenderer} from './PageRenderer';
import {ThemeLayoutWrapper} from './ThemeLayoutWrapper';
import {AdminUsers} from './admin/AdminUsers';
import {AdminPages} from './admin/AdminPages';
import {PageEditor} from './admin/PageEditor';
import {AdminLayout} from './admin/AdminLayout';
import {AdminSchemas} from './admin/AdminSchemas';
import {AdminPlugins} from './admin/AdminPlugins';
import {AdminDashboard} from './admin/AdminDashboard';
import {AdminThemes} from './admin/AdminThemes';
import {PluginSettingsPage} from './admin/PluginSettingsPage';

function App() {
  const {user} = useAuth();

  useEffect(() => {
    document.title = 'Gustav';
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            className:
              '!bg-white dark:!bg-dark-card !text-text dark:!text-white text-xs font-black uppercase tracking-wider rounded-xl border-2 border-l5-border dark:border-dark-border ',
            duration: 3000,
          }}
        />
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/me" replace /> : <LoginPage mode="login" />
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/me" replace />
              ) : (
                <LoginPage mode="register" />
              )
            }
          />

          {/* Admin Section */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="pages/:id" element={<PageEditor />} />
            <Route path="schemas" element={<AdminSchemas />} />
            <Route path="schemas/:slug" element={<AdminSchemas />} />
            <Route path="plugins" element={<AdminPlugins />} />
            <Route path="plugins/:name" element={<PluginSettingsPage />} />
            <Route path="themes" element={<AdminThemes />} />
          </Route>

          {/* Public Website Routes */}
          <Route element={<ThemeLayoutWrapper />}>
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/me" replace />
                ) : (
                  <div
                    css={{
                      padding: '5rem 1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <h1
                      css={{
                        fontSize: '3.75rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.03em',
                        marginBottom: '1rem',
                        color: '#5a5650',
                        '@media (prefers-color-scheme: dark)': {
                          color: '#ffffff',
                        },
                      }}
                    >
                      Welcome to Gustav
                    </h1>
                    <p
                      css={{
                        fontSize: '1.25rem',
                        fontWeight: 500,
                        color: '#5a5650',
                        marginBottom: '3rem',
                      }}
                    >
                      The next generation headless CMS with a professional
                      visual builder.
                    </p>
                    <Link
                      to="/login"
                      css={{
                        display: 'inline-block',
                        backgroundColor: '#121f3d',
                        color: '#ffffff',
                        padding: '1.25rem 2.5rem',
                        borderRadius: '1rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        fontSize: '0.875rem',
                        border: '2px solid #0e2a4a',
                        boxShadow: '0 2px 4px rgba(26,58,106,0.15)',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                        '&:active': {
                          transform: 'translateX(2px) translateY(2px)',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      Start Your Journey
                    </Link>
                  </div>
                )
              }
            />
            <Route path="/me" element={<ProfilePage />} />
            <Route path="*" element={<PageRenderer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;