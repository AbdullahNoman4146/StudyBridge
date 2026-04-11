import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CenteredLoader from "../components/CenteredLoader";
import {
  createAgent,
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
  UserCheck,
  Globe,
  Settings,
  TrendingUp,
  Menu,
  X,
  FileText,
  BarChart3
} from "lucide-react";

interface Country {
  id: number;
  name: string;
}

type ApplicationStatusKey =
  | "submitted"
  | "under_review"
  | "needs_documents"
  | "approved"
  | "rejected";

interface StatusItem {
  key: ApplicationStatusKey;
  label: string;
  count: number;
}

interface AgentApplicationChartRow {
  agent_id: number;
  agent_name: string;
  country_name: string | null;
  total_applications: number;
  statuses: StatusItem[];
}

interface AdminSummary {
  students_count: number;
  agents_count: number;
  total_applications: number;
  agents_with_applications: number;
  application_status_overview: StatusItem[];
  agent_application_status_chart: AgentApplicationChartRow[];
}

const STATUS_COLOR_CLASSES: Record<ApplicationStatusKey, string> = {
  submitted: "bg-blue-500",
  under_review: "bg-amber-500",
  needs_documents: "bg-violet-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500"
};

function StackedStatusBar({
  statuses,
  total,
  heightClass = "h-4"
}: {
  statuses: StatusItem[];
  total: number;
  heightClass?: string;
}) {
  if (total <= 0) {
    return <div className={`${heightClass} w-full rounded-full bg-gray-100`} />;
  }

  return (
    <div className={`${heightClass} w-full rounded-full bg-gray-100 overflow-hidden flex`}>
      {statuses.map((status) => {
        if (status.count <= 0) return null;

        return (
          <div
            key={status.key}
            className={`${STATUS_COLOR_CLASSES[status.key]} h-full`}
            style={{ width: `${(status.count / total) * 100}%` }}
            title={`${status.label}: ${status.count}`}
          />
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [summary, setSummary] = useState<AdminSummary>({
    students_count: 0,
    agents_count: 0,
    total_applications: 0,
    agents_with_applications: 0,
    application_status_overview: [],
    agent_application_status_chart: []
  });

  const [agents, setAgents] = useState<any[]>([]);
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
    } catch (err: any) {
      setFormError(err.message || "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <CenteredLoader
        text="Loading admin dashboard..."
        containerClassName="min-h-[calc(100vh-72px)]"
      />
    );
  }

  const assignedCountryMap = new Map<number, string>();
  agents.forEach((agent) => {
    if (agent.country?.id) {
      assignedCountryMap.set(Number(agent.country.id), agent.name);
    }
  });

  const availableCountryCount = countries.filter(
    (country) => !assignedCountryMap.has(country.id)
  ).length;

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

            <Link
              to="/admin/agents"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <UserCheck size={20} /> Agents
            </Link>

            <Link
              to="/admin/countries"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <Globe size={20} /> Countries
            </Link>

            <Link
              to="/admin/settings"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
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

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between mb-4">
                <UserCheck className="text-green-600" size={24} />
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-500 text-sm">Total Agents</p>
              <p className="text-3xl font-bold">{summary.agents_count}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between mb-4">
                <FileText className="text-violet-600" size={24} />
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-500 text-sm">Total Applications</p>
              <p className="text-3xl font-bold">{summary.total_applications}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between mb-4">
                <BarChart3 className="text-amber-600" size={24} />
              </div>
              <p className="text-gray-500 text-sm">Agents With Applications</p>
              <p className="text-3xl font-bold">{summary.agents_with_applications}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Overall Application Status</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Platform-wide application distribution across all agents
                </p>
              </div>

              <div className="text-sm font-medium text-gray-700">
                Total: {summary.total_applications}
              </div>
            </div>

            {summary.total_applications > 0 ? (
              <>
                <StackedStatusBar
                  statuses={summary.application_status_overview}
                  total={summary.total_applications}
                  heightClass="h-5"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mt-5">
                  {summary.application_status_overview.map((status) => (
                    <div
                      key={status.key}
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${STATUS_COLOR_CLASSES[status.key]}`}
                        />
                        <p className="text-sm text-gray-600">{status.label}</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-gray-500">
                No application data available yet.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-8">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-800">Agent-wise Application Status Chart</h3>
              <p className="text-sm text-gray-500 mt-1">
                See how many applications each agent currently has in each status
              </p>
            </div>

            {summary.agent_application_status_chart.length > 0 ? (
              <div className="space-y-4">
                {summary.agent_application_status_chart.map((agentRow) => (
                  <div
                    key={agentRow.agent_id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {agentRow.agent_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {agentRow.country_name ? `${agentRow.country_name} agent` : "No country assigned"}
                        </p>
                      </div>

                      <div className="text-sm font-medium text-gray-700">
                        Total Applications: {agentRow.total_applications}
                      </div>
                    </div>

                    <div className="mt-4">
                      <StackedStatusBar
                        statuses={agentRow.statuses}
                        total={agentRow.total_applications}
                        heightClass="h-4"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mt-4">
                      {agentRow.statuses.map((status) => (
                        <div
                          key={`${agentRow.agent_id}-${status.key}`}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${STATUS_COLOR_CLASSES[status.key]}`}
                            />
                            <p className="text-sm text-gray-600">{status.label}</p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{status.count}</p>
                        </div>
                      ))}
                    </div>

                    {agentRow.total_applications === 0 && (
                      <p className="text-sm text-gray-500 mt-4">
                        This agent has not received any applications yet.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-gray-500">
                No agents found yet.
              </div>
            )}
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
        </div>
      </main>
    </div>
  );
}