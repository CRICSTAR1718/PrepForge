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
import LevelTest from "./pages/LevelTest";

const RedirectToAppropriateStep = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // NOTE: client-side routing uses whatever fields are available in `user`.
  // Backend test persists `levelTestCompleted`, but we need this to exist
  // in the user object returned by /auth/* for perfect correctness.
  // For MVP, default to onboarding if missing.
  // Persisted user object might be missing levelTestCompleted initially.
  // treat undefined/null as not completed.
  const levelTestCompleted = user.levelTestCompleted === true;

  if (!user.domain) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!levelTestCompleted) {
    // If user is at least intermediate/advanced, they should go to the test.
    // Otherwise onboarding will let them (re)select.
    const level = user.level;
    if (level && level !== "Beginner") {
      return <Navigate to="/level-test" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

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
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedWithNav>
            <Dashboard />
          </ProtectedWithNav>
        }
      />
      <Route
        path="/plan"
        element={
          <ProtectedWithNav>
            <Plan />
          </ProtectedWithNav>
        }
      />
      <Route
        path="/tracker"
        element={
          <ProtectedWithNav>
            <Tracker />
          </ProtectedWithNav>
        }
      />
      <Route
        path="/result"
        element={
          <ProtectedWithNav>
            <Result />
          </ProtectedWithNav>
        }
      />
      <Route
        path="/result/:logId"
        element={
          <ProtectedWithNav>
            <Result />
          </ProtectedWithNav>
        }
      />
      <Route
        path="/mentor"
        element={
          <ProtectedWithNav>
            <Mentor />
          </ProtectedWithNav>
        }
      />

      <Route
        path="/level-test/:level"
        element={
          <ProtectedWithNav>
            <LevelTest />
          </ProtectedWithNav>
        }
      />
      <Route
        path="/level-test"
        element={<Navigate to="/onboarding" replace />}
      />


      <Route
        path="/"
        element={
          <RedirectToAppropriateStep />
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}


