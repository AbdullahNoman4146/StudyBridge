import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import AboutPage from "./views/AboutPage.tsx";
import LandingPage from "./views/LandingPage.tsx";
import Login from "./views/Login";
import Register from "./views/Register";
import Dashboard from "./views/AdminDashboard";
import StudentDashboard from "./views/StudentDashboard";
import { getCurrentUser } from "./api/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();

        localStorage.setItem("role", user.role);
        localStorage.setItem("user", JSON.stringify(user));

        if (allowedRoles && !allowedRoles.includes(user.role)) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleRedirect() {
  const role = localStorage.getItem("role");

  if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
  if (role === "student") return <Navigate to="/student-dashboard" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard" element={<RoleRedirect />} />
    </Routes>
  );
}