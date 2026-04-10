import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CenteredLoader from "../components/CenteredLoader";
import { getCurrentUser, logout } from "../api/auth";
import { clearAuthSession } from "../helpers/authStorage";
import {
  getStoredTheme,
  applyTheme,
  type AppTheme,
} from "../helpers/theme";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  Globe,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>("light");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setLoading(true);

    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setSelectedTheme(getStoredTheme());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (theme: AppTheme) => {
    setSelectedTheme(theme);
    applyTheme(theme);
    setSuccessMessage(`Theme changed to ${theme} mode successfully.`);

    setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthSession();
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <CenteredLoader
        text="Loading settings..."
        containerClassName="min-h-[calc(100vh-72px)]"
      />
    );
  }

  if (!user) {
    return <p className="p-6">Failed to load user data.</p>;
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-100 relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-[72px] z-40 h-[calc(100vh-72px)] w-72 bg-white shadow-md
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="h-full overflow-y-auto">
          <div className="px-5 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Admin workspace
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage system settings and preferences
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden rounded-lg p-2 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/admin-dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>

            <Link
              to="/admin/students"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <Users size={20} />
              Students
            </Link>

            <Link
              to="/admin/agents"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <UserCheck size={20} />
              Agents
            </Link>

            <Link
              to="/admin/countries"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <Globe size={20} />
              Countries
            </Link>

            <Link
              to="/admin/settings"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-xl"
            >
              <Settings size={20} />
              Settings
            </Link>

            <button
              onClick={handleLogout}
              className="mt-6 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"
            >
              Logout
            </button>
          </nav>
        </div>
      </aside>

      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 lg:ml-72">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-6 lg:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm"
            >
              <Menu size={18} />
              Menu
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 break-words">
                Settings
              </h2>
              <p className="text-gray-600 mt-1 break-words">
                Change the appearance and basic preferences of the platform
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm w-full lg:w-auto">
              <div className="min-w-0 flex-1 text-right">
                <p className="text-sm font-medium text-gray-800 break-words">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 break-all">{user.email}</p>
              </div>

              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                {user.name?.charAt(0)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">Appearance</h3>
              <p className="text-sm text-gray-500 mt-1">
                Select the theme you want to use in the dashboard
              </p>
            </div>

            {successMessage && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`rounded-2xl border p-5 text-left transition ${
                  selectedTheme === "light"
                    ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Sun className="text-yellow-600" size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Light Mode</h4>
                    <p className="text-sm text-gray-500">Bright and clean interface</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="h-3 w-24 rounded bg-blue-500 mb-2"></div>
                  <div className="h-3 w-full rounded bg-white border border-gray-200 mb-2"></div>
                  <div className="h-3 w-4/5 rounded bg-white border border-gray-200"></div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`rounded-2xl border p-5 text-left transition ${
                  selectedTheme === "dark"
                    ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center">
                    <Moon className="text-white" size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Dark Mode</h4>
                    <p className="text-sm text-gray-500">Low-light friendly interface</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                  <div className="h-3 w-24 rounded bg-blue-500 mb-2"></div>
                  <div className="h-3 w-full rounded bg-slate-800 border border-slate-700 mb-2"></div>
                  <div className="h-3 w-4/5 rounded bg-slate-800 border border-slate-700"></div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">How it works</h3>
            <p className="text-gray-600 text-sm leading-7">
              This setting is currently stored in the browser using localStorage.
              That means the selected theme remains saved on this device and browser
              even after refresh or logout, until it is changed again.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}