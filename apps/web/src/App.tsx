import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

import {useAuth} from './AuthContext';
import {LoginPage} from './LoginPage';
import {ProfilePage} from './ProfilePage';
import {AdminUsers} from './admin/AdminUsers';
import {AdminLayout} from './admin/AdminLayout';
import {AdminDashboard} from './admin/AdminDashboard';

function App() {
  const {user} = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/me" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
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
        <Route path="/me" element={<ProfilePage />} />

        {/* Admin Section */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
