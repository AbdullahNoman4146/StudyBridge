import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import CenteredLoader from "./components/CenteredLoader";
import AboutPage from "./views/AboutPage";
import LandingPage from "./views/LandingPage";
import Login from "./views/Login";
import Register from "./views/Register";
import AdminDashboard from "./views/AdminDashboard";
import AdminStudentsPage from "./views/AdminStudentsPage";
import AgentDashboard from "./views/AgentDashboard";
import StudentDashboard from "./views/StudentDashboard";
import MainLayout from "./layouts/MainLayout";
import { getCurrentUser } from "./api/auth";
import { clearAuthSession } from "./helpers/authStorage";
import AdminAgentsPage from "./views/AdminAgentsPage";
import AdminCountriesPage from "./views/AdminCountriesPage";
import AdminSettingsPage from "./views/AdminSettingsPage";

interface ProtectedRouteProps {
  children: ReactNode;
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
        clearAuthSession();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (isLoading) {
    return <CenteredLoader text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleRedirect() {
  const role = localStorage.getItem("role");

  if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
  if (role === "agent") return <Navigate to="/agent-dashboard" replace />;
  if (role === "student") return <Navigate to="/student-dashboard" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStudentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/agents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAgentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/countries"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCountriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-dashboard"
          element={
            <ProtectedRoute allowedRoles={["agent"]}>
              <AgentDashboard />
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
      </Route>
    </Routes>
  );
}