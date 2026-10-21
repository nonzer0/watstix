import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Loading } from './components/Loading';
import ConfirmDialog from './components/ConfirmDialog';
import Toaster from './components/Toaster';
import AuthForm from './components/AuthForm';
import Dashboard from './views/Dashboard';
import JobDetail from './views/JobDetail';
import ResetPassword from './views/ResetPassword';

function App() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  return (
    <>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/*"
          element={
            !user ? (
              <AuthForm />
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/job/:id" element={<JobDetail />} />
              </Routes>
            )
          }
        />
      </Routes>
      <ConfirmDialog />
      <Toaster />
    </>
  );
}

export default App;
