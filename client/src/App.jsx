import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Plan from "./pages/Plan";
import Tracker from "./pages/Tracker";
import Result from "./pages/Result";
import Mentor from "./pages/Mentor";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const ProtectedWithNav = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="flex h-screen overflow-hidden bg-cream-50 text-slate-100">
      <Navbar />
      <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain smooth-transition">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedWithNav><Dashboard /></ProtectedWithNav>} />
      <Route path="/plan" element={<ProtectedWithNav><Plan /></ProtectedWithNav>} />
      <Route path="/tracker" element={<ProtectedWithNav><Tracker /></ProtectedWithNav>} />
      <Route path="/result" element={<ProtectedWithNav><Result /></ProtectedWithNav>} />
      <Route path="/result/:logId" element={<ProtectedWithNav><Result /></ProtectedWithNav>} />
      <Route path="/mentor" element={<ProtectedWithNav><Mentor /></ProtectedWithNav>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}


