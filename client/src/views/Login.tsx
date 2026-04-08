import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { setAuthSession } from "../helpers/authStorage";
import AuthPageShell from "../components/auth/AuthPageShell";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.token && data.user) {
        setAuthSession(data.token, data.user);

        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "agent") {
          navigate("/agent-dashboard");
        } else if (data.user.role === "student") {
          navigate("/student-dashboard");
        } else {
          setError("This role is not enabled yet.");
        }
      } else {
        setError(data.message || "Invalid login credentials");
      }
    } catch (err: any) {
      setError("Login failed: " + (err.message || "Server error"));
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
  <AuthPageShell>
    <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/88 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-blue-600">StudyBridge</h1>
        <p className="text-gray-600">Student Consultancy Operations Platform</p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleLogin}>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
              size={20}
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-gray-300 bg-white/90 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
              size={20}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-gray-300 bg-white/90 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Register here
          </Link>
        </p>
        <p className="mt-4">© 2026 StudyBridge. All Rights Reserved.</p>
      </div>
    </div>
  </AuthPageShell>
);
}