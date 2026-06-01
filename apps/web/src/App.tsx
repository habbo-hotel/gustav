import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {useAuth} from './AuthContext';
import {LoginPage} from './LoginPage';
import {ProfilePage} from './ProfilePage';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
