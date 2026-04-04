import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCurrentUser,
  getStudentsList,
  deleteStudent,
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
  Trash2
} from "lucide-react";

export default function AdminStudentsPage() {
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentsPage();
  }, []);

  const loadStudentsPage = async () => {
    setLoading(true);
    try {
      const [userData, studentsData] = await Promise.all([
        getCurrentUser(),
        getStudentsList()
      ]);

      setUser(userData);
      setStudents(studentsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to remove this student?");
    if (!confirmed) return;

    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (error: any) {
      alert(error.message || "Failed to remove student");
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
    return <p className="p-6">Loading...</p>;
  }

  if (!user) {
    return <p className="p-6">Failed to load user data.</p>;
  }

  return (
    <div className="flex min-h-[calc(100vh-88px)] bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <nav className="flex-1 p-4">
          <Link
            to="/admin-dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2"
          >
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          <Link
            to="/admin/students"
            className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg mb-2"
          >
            <Users size={20} /> Students
          </Link>

          <a
            href="/applications"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2"
          >
            <FileText size={20} /> Applications
          </a>

          <a
            href="/documents"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2"
          >
            <File size={20} /> Documents
          </a>

          <a
            href="/countries-visa"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2"
          >
            <Globe size={20} /> Countries & Visa
          </a>

          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mb-2"
          >
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
              <h2 className="text-3xl font-bold text-gray-800">Students</h2>
              <p className="text-gray-600 mt-1">
                Manage all registered students from this page
              </p>
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Students List</h3>

              <button
                onClick={loadStudentsPage}
                className="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-500">
              Total students: <span className="font-semibold text-gray-800">{students.length}</span>
            </div>

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
                        <td className="px-4 py-3 border-b">
                          {student.student_profile?.phone || "-"}
                        </td>
                        <td className="px-4 py-3 border-b">
                          {student.student_profile?.address || "-"}
                        </td>
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
          </div>
        </div>
      </main>
    </div>
  );
}