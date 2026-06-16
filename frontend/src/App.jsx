import { useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    if (token && userName) {
      return { userName, token };
    }
    return null;
  });

  const isAuthenticated = useMemo(() => Boolean(currentUser), [currentUser]);

  const handleAuthSuccess = ({ userName, token }) => {
    setCurrentUser({ userName, token });
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onNavigateToSignup={() => navigate("/signup")}
              onAuthSuccess={handleAuthSuccess}
            />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Signup
              onNavigateToLogin={() => navigate("/login")}
              onAuthSuccess={handleAuthSuccess}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <DashboardPage
              username={currentUser.userName}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
