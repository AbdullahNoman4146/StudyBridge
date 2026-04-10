import { useEffect, useState } from "react";
import CenteredLoader from "../components/CenteredLoader";
import { Link } from "react-router-dom";
import {
  getCurrentUser,
  getAgentsList,
  deleteAgent,
  logout,
} from "../api/auth";
import { clearAuthSession } from "../helpers/authStorage";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  File,
  Globe,
  Settings,
  Trash2,
  Loader2,
  Menu,
  X,
} from "lucide-react";

interface AgentCountry {
  id?: number;
  name?: string;
}

interface Agent {
  id: number;
  name: string;
  email: string;
  status: string;
  country?: AgentCountry | null;
}

export default function AdminAgentsPage() {
  const [user, setUser] = useState<any>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  useEffect(() => {
    loadAgentsPage();
  }, []);

  const sortAgentsAscending = (agentList: Agent[]) => {
    return [...agentList].sort((a, b) => a.id - b.id);
  };

  const loadAgentsPage = async () => {
    setLoading(true);

    try {
      const [userData, agentsData] = await Promise.all([
        getCurrentUser(),
        getAgentsList(),
      ]);

      setUser(userData);
      setAgents(sortAgentsAscending(agentsData));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (id: number, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${name}?`);
    if (!confirmed) return;

    setDeleteLoadingId(id);

    try {
      await deleteAgent(id);
      setAgents((prev) =>
        sortAgentsAscending(prev.filter((agent) => agent.id !== id))
      );
    } catch (error: any) {
      alert(error.message || "Failed to remove agent");
    } finally {
      setDeleteLoadingId(null);
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
  return (
    <CenteredLoader
      text="Loading agents..."
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
                Manage agents and operations
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
              className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-xl"
            >
              <UserCheck size={20} />
              Agents
            </Link>

           <Link
               to="/admin/countries"
               onClick={() => setIsSidebarOpen(false)}
               className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
                       <Globe size={20} /> Countries
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
                Agents
              </h2>
              <p className="text-gray-600 mt-1 break-words">
                Manage all registered agents from this page
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

          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Agents List</h3>

              <button
                onClick={loadAgentsPage}
                className="w-full sm:w-auto text-sm px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-500">
              Total agents:{" "}
              <span className="font-semibold text-gray-800">{agents.length}</span>
            </div>

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
                    agents.map((agent) => {
                      const isRemoving = deleteLoadingId === agent.id;

                      return (
                        <tr key={agent.id} className="hover:bg-gray-50 align-top">
                          <td className="px-4 py-3 border-b">{agent.id}</td>
                          <td className="px-4 py-3 border-b break-words">{agent.name}</td>
                          <td className="px-4 py-3 border-b break-all">{agent.email}</td>
                          <td className="px-4 py-3 border-b break-words">
                            {agent.country?.name || "-"}
                          </td>
                          <td className="px-4 py-3 border-b">{agent.status}</td>
                          <td className="px-4 py-3 border-b">
                            <button
                              onClick={() => handleDeleteAgent(agent.id, agent.name)}
                              disabled={isRemoving}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                            >
                              {isRemoving ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Removing...
                                </>
                              ) : (
                                <>
                                  <Trash2 size={16} />
                                  Remove
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}