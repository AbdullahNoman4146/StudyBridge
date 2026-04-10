import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createAgent,
  deleteAgent,
  getAdminSummary,
  getAgentsList,
  getCountries,
  getCurrentUser,
  logout
} from "../api/auth";
import { clearAuthSession } from "../helpers/authStorage";

import {
  LayoutDashboard,
  Users,
  FileText,
  File,
  Globe,
  Settings,
  TrendingUp,
  UserCheck,
  Clock,
  FileWarning,
  BarChart3,
  Bell,
  Trash2,
  Menu,
  X
} from "lucide-react";

interface Country {
  id: number;
  name: string;
}

type ViewMode = "agents" | null;

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [summary, setSummary] = useState({
    students_count: 0,
    agents_count: 0
  });

  const [agents, setAgents] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<ViewMode>(null);
  const [listLoading, setListLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    country_id: ""
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [userData, countriesData, summaryData, agentsData] = await Promise.all([
        getCurrentUser(),
        getCountries(),
        getAdminSummary(),
        getAgentsList()
      ]);

      setUser(userData);
      setCountries(countriesData);
      setSummary(summaryData);
      setAgents(agentsData);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshSummary = async () => {
    try {
      const data = await getAdminSummary();
      setSummary(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowAgents = async () => {
    setActiveView("agents");
    setListLoading(true);
    try {
      const data = await getAgentsList();
      setAgents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setListLoading(false);
    }
  };

  const handleDeleteAgent = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to remove this agent?");
    if (!confirmed) return;

    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((item) => item.id !== id));
      await refreshSummary();
    } catch (error: any) {
      alert(error.message || "Failed to remove agent");
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

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    const isCountryAlreadyAssigned = agents.some(
      (agent) => Number(agent.country?.id) === Number(form.country_id)
    );

    if (isCountryAlreadyAssigned) {
      setFormError("This country already has an assigned agent. Please choose another country.");
      setSubmitting(false);
      return;
    }

    try {
      const data = await createAgent(
        form.name,
        form.email,
        form.password,
        Number(form.country_id)
      );

      setFormSuccess(
        `${data.agent.name} created successfully for ${data.agent.country?.name || "selected country"}`
      );

      setForm({
        name: "",
        email: "",
        password: "",
        country_id: ""
      });

      setAgents((prev) => [data.agent, ...prev.filter((item) => item.id !== data.agent.id)]);

      await refreshSummary();

      if (activeView === "agents") {
        await handleShowAgents();
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <p className="p-6">Loading...</p>;

  const assignedCountryMap = new Map<number, string>();
  agents.forEach((agent) => {
    if (agent.country?.id) {
      assignedCountryMap.set(Number(agent.country.id), agent.name);
    }
  });

  const availableCountryCount = countries.filter(
    (country) => !assignedCountryMap.has(country.id)
  ).length;

  const alerts = [
    {
      title: "Visa Expiry Alert",
      desc: "15 student visas expiring in 30 days",
      time: "2 hours ago"
    },
    {
      title: "Pending Documents",
      desc: "23 documents need verification",
      time: "5 hours ago"
    },
    {
      title: "New Applications",
      desc: "12 new applications received",
      time: "1 day ago"
    },
    {
      title: "Approvals Completed",
      desc: "8 applications approved today",
      time: "1 day ago"
    }
  ];

  const chartData = [
    { month: "Jan", value: 85, label: "142" },
    { month: "Feb", value: 70, label: "118" },
    { month: "Mar", value: 90, label: "156" },
    { month: "Apr", value: 75, label: "128" },
    { month: "May", value: 95, label: "167" },
    { month: "Jun", value: 88, label: "148" }
  ];

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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Admin workspace</h2>
              <p className="text-sm text-gray-500 mt-1">Manage platform operations</p>
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
              className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-xl"
            >
              <LayoutDashboard size={20} /> Dashboard
            </Link>

            <Link
              to="/admin/students"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <Users size={20} /> Students
            </Link>

            <a
              href="/applications"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <FileText size={20} /> Applications
            </a>

            <a
              href="/documents"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <File size={20} /> Documents
            </a>

            <a
              href="/countries-visa"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <Globe size={20} /> Countries & Visa
            </a>

            <a
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <Settings size={20} /> Settings
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
                Admin Dashboard
              </h2>
              <p className="text-gray-600 mt-1 break-words">Welcome back, {user.name}</p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm w-full lg:w-auto">
              <div className="min-w-0 flex-1 text-right">
                <p className="text-sm font-medium text-gray-800 break-words">{user.name}</p>
                <p className="text-xs text-gray-500 break-all">{user.email}</p>
              </div>

              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                {user.name?.charAt(0)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between mb-4">
                <Users className="text-blue-600" size={24} />
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-3xl font-bold">{summary.students_count}</p>
            </div>

            <button
              onClick={handleShowAgents}
              className="bg-white rounded-2xl shadow-md p-6 text-left hover:shadow-lg transition"
            >
              <div className="flex justify-between mb-4">
                <UserCheck className="text-green-600" size={24} />
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-500 text-sm">Total Agents</p>
              <p className="text-3xl font-bold">{summary.agents_count}</p>
              <p className="text-xs text-blue-600 mt-2">Click to view list</p>
            </button>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between mb-4">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <p className="text-gray-500 text-sm">Pending Visas</p>
              <p className="text-3xl font-bold">156</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between mb-4">
                <FileWarning className="text-red-600" size={24} />
              </div>
              <p className="text-gray-500 text-sm">Urgent Actions</p>
              <p className="text-3xl font-bold">23</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Agent</h3>

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

            <form onSubmit={handleCreateAgent} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Agent name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="email"
                placeholder="Agent gmail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="Primary password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={form.country_id}
                onChange={(e) => setForm({ ...form, country_id: e.target.value })}
                required
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select assigned country</option>
                {countries.map((country) => (
                  <option
                    key={country.id}
                    value={country.id}
                    disabled={assignedCountryMap.has(country.id)}
                  >
                    {country.name}
                    {assignedCountryMap.has(country.id)
                      ? ` — already assigned to ${assignedCountryMap.get(country.id)}`
                      : ""}
                  </option>
                ))}
              </select>

              <div className="md:col-span-2 xl:col-span-4">
                <p className="text-sm text-gray-500 mb-3">
                  {availableCountryCount > 0
                    ? `${availableCountryCount} country slots are currently available for new agents.`
                    : "All countries are already assigned. Remove an agent first to free a country slot."}
                </p>
                <button
                  type="submit"
                  disabled={submitting || availableCountryCount === 0}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? "Creating agent..." : "Create Agent"}
                </button>
              </div>
            </form>
          </div>

          {activeView === "agents" && (
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Agents List</h3>

                <button
                  onClick={() => setActiveView(null)}
                  className="w-full sm:w-auto text-sm px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Close
                </button>
              </div>

              {listLoading ? (
                <p className="text-gray-500">Loading list...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 border-b">ID</th>
                        <th className="text-left px-4 py-3 border-b">Name</th>
                        <th className="text-left px-4 py-3 border-b">Email</th>
                        <th className="text-left px-4 py-3 border-b">Assigned Country</th>
                        <th className="text-left px-4 py-3 border-b">Status</th>
                        <th className="text-left px-4 py-3 border-b">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                            No agents found
                          </td>
                        </tr>
                      ) : (
                        agents.map((agent) => (
                          <tr key={agent.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 border-b">{agent.id}</td>
                            <td className="px-4 py-3 border-b break-words">{agent.name}</td>
                            <td className="px-4 py-3 border-b break-all">{agent.email}</td>
                            <td className="px-4 py-3 border-b break-words">{agent.country?.name || "-"}</td>
                            <td className="px-4 py-3 border-b">{agent.status}</td>
                            <td className="px-4 py-3 border-b">
                              <button
                                onClick={() => handleDeleteAgent(agent.id)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                              >
                                <Trash2 size={16} />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold">Application Trends</h3>
              </div>

              <div className="space-y-4">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-10 shrink-0">{item.month}</span>

                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-blue-600 h-8 rounded-full flex items-center justify-end pr-3"
                        style={{ width: `${item.value}%` }}
                      >
                        <span className="text-white text-xs">{item.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold">Alerts</h3>
              </div>

              <div className="space-y-4">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="border-l-4 pl-4 py-2 border-gray-200">
                    <p className="text-sm font-semibold break-words">{alert.title}</p>
                    <p className="text-xs text-gray-600 break-words">{alert.desc}</p>
                    <p className="text-xs text-gray-400">{alert.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}