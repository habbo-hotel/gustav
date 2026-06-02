import {BrowserRouter, Routes, Route, Navigate, Link} from 'react-router-dom';

import {useAuth} from './AuthContext';
import {LoginPage} from './LoginPage';
import {ProfilePage} from './ProfilePage';
import {PageRenderer} from './PageRenderer';
import {PublicLayout} from './PublicLayout';
import {AdminUsers} from './admin/AdminUsers';
import {AdminPages} from './admin/AdminPages';
import {PageEditor} from './admin/PageEditor';
import {AdminLayout} from './admin/AdminLayout';
import {AdminDashboard} from './admin/AdminDashboard';

function App() {
  const {user} = useAuth();

  return (
    <BrowserRouter>
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
            user ? <Navigate to="/me" replace /> : <LoginPage mode="register" />
          }
        />

        {/* Admin Section */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="pages/:id" element={<PageEditor />} />
        </Route>

        {/* Public Website Routes (Last to avoid shadowing static routes) */}
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/me" replace />
              ) : (
                <div className="p-20 text-center">
                  <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 text-gray-900 dark:text-white">Welcome to Gustav</h1>
                  <p className="text-xl text-gray-500 font-medium mb-12">The next generation headless CMS with a professional visual builder.</p>
                  <Link to="/login" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-sm shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all inline-block">
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
  );
}

export default App;
