import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./views/Login";
import Register from "./views/Register";
import Dashboard from "./views/AdminDashboard";
import AgentDashboard from "./views/AgentDashboard";
import StudentDashboard from "./views/StudentDashboard";
import { getCurrentUser } from "./api/auth";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // if provided, user must have one of these roles
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      if (allowedRoles && role && !allowedRoles.includes(role)) {
        // user is logged in but not in the correct role
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify token with server
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem("token");
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


// convenient component for redirecting generic /dashboard path
function RoleRedirect() {
  const role = localStorage.getItem('role');
  if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
  if (role === 'agent') return <Navigate to="/agent-dashboard" replace />;
  if (role === 'student') return <Navigate to="/student-dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
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

      {/* generic dashboard path, will bounce to the appropriate dashboard */}
      <Route path="/dashboard" element={<RoleRedirect />} />
    </Routes>
  );

}