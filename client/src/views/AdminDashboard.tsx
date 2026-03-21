import { useEffect, useState } from "react";
import {
  createAgent,
  deleteAgent,
  deleteStudent,
  getAdminSummary,
  getAgentsList,
  getCountries,
  getCurrentUser,
  getStudentsList,
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
  Trash2
} from "lucide-react";

interface Country {
  id: number;
  name: string;
}

type ViewMode = "students" | "agents" | null;

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [summary, setSummary] = useState({
    students_count: 0,
    agents_count: 0
  });

  const [students, setStudents] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<ViewMode>(null);
  const [listLoading, setListLoading] = useState(false);

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

  const handleShowStudents = async () => {
    setActiveView("students");
    setListLoading(true);
    try {
      const data = await getStudentsList();
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setListLoading(false);
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

  const handleDeleteStudent = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to remove this student?");
    if (!confirmed) return;

    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((item) => item.id !== id));
      await refreshSummary();
    } catch (error: any) {
      alert(error.message || "Failed to remove student");
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

  const availableCountryCount = countries.filter((country) => !assignedCountryMap.has(country.id)).length;

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
    <div className="flex min-h-[calc(100vh-88px)] bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <nav className="flex-1 p-4">
          <a href="/admin-dashboard" className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg mb-2">
            <LayoutDashboard size={20} /> Dashboard
          </a>

          <a href="/students" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2">
            <Users size={20} /> Students
          </a>

          <a href="/applications" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2">
            <FileText size={20} /> Applications
          </a>

          <a href="/documents" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2">
            <File size={20} /> Documents
          </a>

          <a href="/countries-visa" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2">
            <Globe size={20} /> Countries & Visa
          </a>

          <a href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2">
            <Settings size={20} /> Settings
          </a>

          <button
            onClick={handleLogout}
            className="mt-6 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
              <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-8">
            <button
              onClick={handleShowStudents}
              className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition"
            >
              <div className="flex justify-between mb-4">
                <Users className="text-blue-600" size={24} />
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-3xl font-bold">{summary.students_count}</p>
              <p className="text-xs text-blue-600 mt-2">Click to view list</p>
            </button>

            <button
              onClick={handleShowAgents}
              className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition"
            >
              <div className="flex justify-between mb-4">
                <UserCheck className="text-green-600" size={24} />
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-500 text-sm">Total Agents</p>
              <p className="text-3xl font-bold">{summary.agents_count}</p>
              <p className="text-xs text-blue-600 mt-2">Click to view list</p>
            </button>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-4">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <p className="text-gray-500 text-sm">Pending Visas</p>
              <p className="text-3xl font-bold">156</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-4">
                <FileWarning className="text-red-600" size={24} />
              </div>
              <p className="text-gray-500 text-sm">Urgent Actions</p>
              <p className="text-3xl font-bold">23</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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

            <form onSubmit={handleCreateAgent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Agent name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="email"
                placeholder="Agent gmail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="Primary password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={form.country_id}
                onChange={(e) => setForm({ ...form, country_id: e.target.value })}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select assigned country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id} disabled={assignedCountryMap.has(country.id)}>
                    {country.name}{assignedCountryMap.has(country.id) ? ` — already assigned to ${assignedCountryMap.get(country.id)}` : ""}
                  </option>
                ))}
              </select>

              <div className="md:col-span-4">
                <p className="text-sm text-gray-500 mb-3">
                  {availableCountryCount > 0
                    ? `${availableCountryCount} country slots are currently available for new agents.`
                    : "All countries are already assigned. Remove an agent first to free a country slot."}
                </p>
                <button
                  type="submit"
                  disabled={submitting || availableCountryCount === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? "Creating agent..." : "Create Agent"}
                </button>
              </div>
            </form>
          </div>

          {activeView && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {activeView === "students" ? "Students List" : "Agents List"}
                </h3>

                <button
                  onClick={() => setActiveView(null)}
                  className="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>

              {listLoading ? (
                <p className="text-gray-500">Loading list...</p>
              ) : activeView === "students" ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 border-b">ID</th>
                        <th className="text-left px-4 py-3 border-b">Name</th>
                        <th className="text-left px-4 py-3 border-b">Email</th>
                        <th className="text-left px-4 py-3 border-b">Phone</th>
                        <th className="text-left px-4 py-3 border-b">Address</th>
                        <th className="text-left px-4 py-3 border-b">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                            No students found
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 border-b">{student.id}</td>
                            <td className="px-4 py-3 border-b">{student.name}</td>
                            <td className="px-4 py-3 border-b">{student.email}</td>
                            <td className="px-4 py-3 border-b">{student.student_profile?.phone || "-"}</td>
                            <td className="px-4 py-3 border-b">{student.student_profile?.address || "-"}</td>
                            <td className="px-4 py-3 border-b">
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
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
                            <td className="px-4 py-3 border-b">{agent.name}</td>
                            <td className="px-4 py-3 border-b">{agent.email}</td>
                            <td className="px-4 py-3 border-b">{agent.country?.name || "-"}</td>
                            <td className="px-4 py-3 border-b">{agent.status}</td>
                            <td className="px-4 py-3 border-b">
                              <button
                                onClick={() => handleDeleteAgent(agent.id)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
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

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold">Application Trends</h3>
              </div>

              <div className="space-y-4">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-10">{item.month}</span>

                    <div className="flex-1 bg-gray-100 rounded-full h-8">
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold">Alerts</h3>
              </div>

              <div className="space-y-4">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="border-l-4 pl-4 py-2 border-gray-200">
                    <p className="text-sm font-semibold">{alert.title}</p>
                    <p className="text-xs text-gray-600">{alert.desc}</p>
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