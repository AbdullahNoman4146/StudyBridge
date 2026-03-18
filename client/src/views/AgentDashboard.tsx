import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Globe,
  Bell,
  Calendar,
  Lock
} from "lucide-react";
import { changeAgentPassword, getCurrentUser, logout } from "../api/auth";
import { clearAuthSession } from "../helpers/authStorage";

export default function AgentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("role", data.role);
      } catch (error) {
        clearAuthSession();
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthSession();
      window.location.href = "/login";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await changeAgentPassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(data.message || "Password changed successfully");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="flex min-h-[calc(100vh-88px)] bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">StudyBridge</h1>
        </div>

        <nav className="flex-1 p-4">
          <a href="/agent-dashboard" className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg mb-2">
            <LayoutDashboard size={20} /> Dashboard
          </a>

          <button
            onClick={handleLogout}
            className="mt-6 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Agent Dashboard</h2>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{user.email}</p>
            <p className="text-xs text-gray-500">
              Assigned Country: {user.country?.name || "Not assigned"}
            </p>
          </div>
        </div>

        {user.must_change_password ? (
          <div className="max-w-2xl bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-blue-600" size={24} />
              <h3 className="text-2xl font-bold text-gray-800">Change Primary Password</h3>
            </div>

            <p className="text-gray-600 mb-6">
              You logged in with the primary password created by the admin. Please change it now before continuing.
            </p>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {submitting ? "Updating password..." : "Change Password"}
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-blue-600" size={24} />
                <h3 className="text-lg font-bold">Assigned Country</h3>
              </div>
              <p className="text-2xl font-bold">{user.country?.name || "Not assigned"}</p>
              <p className="text-sm text-gray-500 mt-2">You handle students targeting this scholarship destination.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="text-blue-600" size={24} />
                <h3 className="text-lg font-bold">Today's Tasks</h3>
              </div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-gray-500 mt-2">Review applications and follow up with students.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="text-blue-600" size={24} />
                <h3 className="text-lg font-bold">Alerts</h3>
              </div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-gray-500 mt-2">Missing documents and pending deadlines.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}