import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Loading } from "./components/Loading";
import AuthForm from "./components/AuthForm";
import Dashboard from "./views/Dashboard";
import JobDetail from "./views/JobDetail";

function App() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/job/:id" element={<JobDetail />} />
    </Routes>
  );
}

export default App;
