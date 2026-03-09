import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../api/auth";

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
  Bell
} from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
  };

  if (!user) return <p className="p-6">Loading...</p>;

  const alerts = [
    {
      type: "urgent",
      title: "Visa Expiry Alert",
      desc: "15 student visas expiring in 30 days",
      time: "2 hours ago"
    },
    {
      type: "warning",
      title: "Pending Documents",
      desc: "23 documents need verification",
      time: "5 hours ago"
    },
    {
      type: "info",
      title: "New Applications",
      desc: "12 new applications received",
      time: "1 day ago"
    },
    {
      type: "success",
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">StudyBridge</h1>
        </div>

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

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">

          {/* Header */}
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

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-4">
                <Users className="text-blue-600" size={24} />
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-3xl font-bold">1,247</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-4">
                <UserCheck className="text-green-600" size={24} />
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-500 text-sm">Active Applications</p>
              <p className="text-3xl font-bold">892</p>
            </div>

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

          {/* Chart + Alerts */}
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