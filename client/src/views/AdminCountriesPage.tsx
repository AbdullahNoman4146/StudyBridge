import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCurrentUser,
  getCountries,
  createCountry,
  logout,
} from "../api/auth";
import { clearAuthSession } from "../helpers/authStorage";
import CenteredLoader from "../components/CenteredLoader";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  Globe,
  Settings,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";

interface Country {
  id: number;
  name: string;
}

export default function AdminCountriesPage() {
  const [user, setUser] = useState<any>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [countryName, setCountryName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    loadCountriesPage();
  }, []);

  const loadCountriesPage = async () => {
    setLoading(true);

    try {
      const [userData, countriesData] = await Promise.all([
        getCurrentUser(),
        getCountries(),
      ]);

      const sortedCountries = [...countriesData].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setUser(userData);
      setCountries(sortedCountries);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const data = await createCountry(countryName);

      setCountries((prev) =>
        [...prev, data.country].sort((a, b) => a.name.localeCompare(b.name))
      );

      setFormSuccess(`${data.country.name} added successfully`);
      setCountryName("");
    } catch (error: any) {
      setFormError(error.message || "Failed to add country");
    } finally {
      setSubmitting(false);
    }
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
    return <CenteredLoader text="Loading countries..." />;
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
                Manage countries and operations
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
              className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-xl"
            >
              <Globe size={20} />
              Countries
            </Link>

            <a
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <Settings size={20} />
              Settings
            </a>

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
        <div className="max-w-7xl mx-auto">
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
                Countries
              </h2>
              <p className="text-gray-600 mt-1 break-words">
                Add countries for agent assignment
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

          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle className="text-blue-600" size={22} />
              <h3 className="text-xl font-bold text-gray-800">Add Country</h3>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {formSuccess}
              </div>
            )}

            <form
              onSubmit={handleAddCountry}
              className="flex flex-col md:flex-row gap-4"
            >
              <input
                type="text"
                placeholder="Enter country name"
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Country"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Countries List</h3>

              <button
                onClick={loadCountriesPage}
                className="w-full sm:w-auto text-sm px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-500">
              Total countries:{" "}
              <span className="font-semibold text-gray-800">{countries.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Country Name</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.map((country) => (
                    <tr key={country.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">{country.id}</td>
                      <td className="py-3 px-4 text-gray-800 font-medium">
                        {country.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {countries.length === 0 && (
              <p className="text-sm text-gray-500 mt-4">No countries found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}