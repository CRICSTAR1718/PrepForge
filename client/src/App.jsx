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
    <>
      <Navbar />
      {children}
    </>
  );
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Protected — no navbar (onboarding is a focused flow) */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      {/* Protected — with navbar */}
      <Route path="/dashboard" element={<ProtectedWithNav><Dashboard /></ProtectedWithNav>} />
      <Route path="/plan" element={<ProtectedWithNav><Plan /></ProtectedWithNav>} />
      <Route path="/tracker" element={<ProtectedWithNav><Tracker /></ProtectedWithNav>} />
      <Route path="/result/:logId" element={<ProtectedWithNav><Result /></ProtectedWithNav>} />
      <Route path="/mentor" element={<ProtectedWithNav><Mentor /></ProtectedWithNav>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}