import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  LayoutDashboard,
  Globe,
  Bell,
  Calendar,
  Lock,
  BookOpen,
  FileText,
  Save,
  PencilLine,
  Download,
  CheckCircle2,
  Clock3,
  BadgeAlert,
  XCircle,
  MessageSquare,
  Send,
  Plus,
  X,
  ListChecks
} from "lucide-react";
import { changeAgentPassword, getCurrentUser, logout } from "../api/auth";
import {
  createScholarship,
  downloadApplicationDocument,
  getAgentApplications,
  getAgentScholarships,
  sendAgentDeadlineReminder,
  sendApplicationMessage,
  type Scholarship,
  type ScholarshipApplication,
  type ScholarshipPayload,
  type ApplicationMessageItem,
  updateAgentApplicationStatus,
  updateScholarship
} from "../api/scholarships";
import { clearAuthSession } from "../helpers/authStorage";

const emptyScholarshipForm: ScholarshipPayload = {
  title: "",
  university_name: "",
  degree_level: "Bachelor",
  funding_type: "Partial scholarship",
  amount: "",
  deadline: "",
  intake: "",
  description: "",
  eligibility: "",
  application_instructions: "",
  required_documents: [],
  status: "active"
};

type AgentTab = "overview" | "scholarships" | "applications";

function formatDate(date?: string | null) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatDateTime(date?: string | null) {
  if (!date) return "N/A";

  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function statusMeta(status: ScholarshipApplication["status"]) {
  switch (status) {
    case "approved":
      return {
        label: "Approved",
        className: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle2 size={14} />
      };
    case "rejected":
      return {
        label: "Rejected",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={14} />
      };
    case "under_review":
      return {
        label: "Under Review",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Clock3 size={14} />
      };
    case "needs_documents":
      return {
        label: "Needs Documents",
        className: "bg-amber-100 text-amber-700 border-amber-200",
        icon: <BadgeAlert size={14} />
      };
    default:
      return {
        label: "Submitted",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <FileText size={14} />
      };
  }
}

function ChatMessageBubble({ item, currentUserId }: { item: ApplicationMessageItem; currentUserId: number }) {
  const isMine = item.sender_id === currentUserId;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isMine ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800 border border-slate-200"}`}>
        <div className="flex items-center gap-2 text-xs mb-1 opacity-90">
          <span className="font-semibold">{item.sender?.name || (isMine ? "You" : "Student")}</span>
          <span>•</span>
          <span>{formatDateTime(item.created_at)}</span>
        </div>
        <p className="text-sm leading-6 whitespace-pre-wrap">{item.message}</p>
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AgentTab>("overview");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [messageSuccess, setMessageSuccess] = useState("");
  const [scholarshipForm, setScholarshipForm] = useState<ScholarshipPayload>(emptyScholarshipForm);
  const [documentInput, setDocumentInput] = useState("");
  const [submittingScholarship, setSubmittingScholarship] = useState(false);
  const [editingScholarshipId, setEditingScholarshipId] = useState<number | null>(null);
  const [savingApplicationId, setSavingApplicationId] = useState<number | null>(null);
  const [expandedApplicationId, setExpandedApplicationId] = useState<number | null>(null);
  const [applicationDrafts, setApplicationDrafts] = useState<Record<number, { status: ScholarshipApplication["status"]; agent_note: string }>>({});
  const [messageDrafts, setMessageDrafts] = useState<Record<number, string>>({});
  const [sendingMessageForId, setSendingMessageForId] = useState<number | null>(null);
  const [sendingDeadlineReminderForId, setSendingDeadlineReminderForId] = useState<number | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
        localStorage.setItem("role", currentUser.role);

        if (!currentUser.must_change_password) {
          const [agentScholarships, agentApplications] = await Promise.all([
            getAgentScholarships(),
            getAgentApplications()
          ]);

          setScholarships(agentScholarships);
          setApplications(agentApplications);
        }
      } catch (error) {
        clearAuthSession();
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  useEffect(() => {
    const drafts: Record<number, { status: ScholarshipApplication["status"]; agent_note: string }> = {};
    applications.forEach((application) => {
      drafts[application.id] = {
        status: application.status,
        agent_note: application.agent_note || ""
      };
    });
    setApplicationDrafts(drafts);
  }, [applications]);

  const stats = useMemo(() => {
    const activeScholarships = scholarships.filter((item) => item.status === "active").length;
    const openApplications = applications.filter((item) => ["submitted", "under_review", "needs_documents"].includes(item.status)).length;
    const upcomingDeadlines = scholarships.filter((item) => item.status === "active" && new Date(item.deadline) >= new Date()).length;

    return {
      activeScholarships,
      totalApplications: applications.length,
      openApplications,
      upcomingDeadlines
    };
  }, [applications, scholarships]);

  const refreshData = async () => {
    const [agentScholarships, agentApplications] = await Promise.all([
      getAgentScholarships(),
      getAgentApplications()
    ]);

    setScholarships(agentScholarships);
    setApplications(agentApplications);
  };

  const resetScholarshipForm = () => {
    setScholarshipForm(emptyScholarshipForm);
    setDocumentInput("");
    setEditingScholarshipId(null);
    setFormError("");
    setFormSuccess("");
  };

  const addRequiredDocument = (value?: string) => {
    const nextValue = (value ?? documentInput).trim();

    if (!nextValue) return;

    if (scholarshipForm.required_documents.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
      setDocumentInput("");
      return;
    }

    setScholarshipForm((prev) => ({
      ...prev,
      required_documents: [...prev.required_documents, nextValue]
    }));
    setDocumentInput("");
  };

  const removeRequiredDocument = (value: string) => {
    setScholarshipForm((prev) => ({
      ...prev,
      required_documents: prev.required_documents.filter((item) => item !== value)
    }));
  };

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

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setSubmittingPassword(true);

    try {
      const data = await changeAgentPassword(currentPassword, newPassword, confirmPassword) as { user: any; message?: string };

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);

      const [agentScholarships, agentApplications] = await Promise.all([
        getAgentScholarships(),
        getAgentApplications()
      ]);

      setScholarships(agentScholarships);
      setApplications(agentApplications);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(data.message || "Password changed successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      setPasswordError(message);
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleScholarshipSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittingScholarship(true);
    setFormError("");
    setFormSuccess("");
    setMessageSuccess("");

    const payload: ScholarshipPayload = {
      ...scholarshipForm,
      required_documents: scholarshipForm.required_documents
    };

    try {
      const response = editingScholarshipId
        ? await updateScholarship(editingScholarshipId, payload)
        : await createScholarship(payload);

      await refreshData();
      resetScholarshipForm();
      setFormSuccess(response.message);
      setActiveTab("scholarships");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save scholarship";
      setFormError(message);
    } finally {
      setSubmittingScholarship(false);
    }
  };

  const startEditScholarship = (scholarship: Scholarship) => {
    setEditingScholarshipId(scholarship.id);
    setScholarshipForm({
      title: scholarship.title,
      university_name: scholarship.university_name,
      degree_level: scholarship.degree_level,
      funding_type: scholarship.funding_type,
      amount: scholarship.amount || "",
      deadline: scholarship.deadline ? scholarship.deadline.slice(0, 10) : "",
      intake: scholarship.intake || "",
      description: scholarship.description,
      eligibility: scholarship.eligibility || "",
      application_instructions: scholarship.application_instructions || "",
      required_documents: scholarship.required_documents || [],
      status: scholarship.status
    });
    setDocumentInput("");
    setFormError("");
    setFormSuccess("");
    setActiveTab("scholarships");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplicationDraftChange = (
    applicationId: number,
    field: "status" | "agent_note",
    value: string
  ) => {
    setApplicationDrafts((prev) => ({
      ...prev,
      [applicationId]: {
        status: field === "status"
          ? (value as ScholarshipApplication["status"])
          : (prev[applicationId]?.status || "submitted"),
        agent_note: field === "agent_note"
          ? value
          : (prev[applicationId]?.agent_note || "")
      }
    }));
  };

  const handleApplicationUpdate = async (applicationId: number) => {
    const draft = applicationDrafts[applicationId];
    if (!draft) return;

    setSavingApplicationId(applicationId);
    setPageError("");
    setMessageSuccess("");

    try {
      await updateAgentApplicationStatus(applicationId, draft.status, draft.agent_note);
      await refreshData();
      setMessageSuccess("Application status updated successfully");
      setExpandedApplicationId(applicationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update application";
      setPageError(message);
    } finally {
      setSavingApplicationId(null);
    }
  };

  const handleSendMessage = async (applicationId: number) => {
    const draft = (messageDrafts[applicationId] || "").trim();

    if (!draft) {
      setPageError("Please write a message before sending.");
      return;
    }

    setSendingMessageForId(applicationId);
    setPageError("");
    setMessageSuccess("");

    try {
      const response = await sendApplicationMessage(applicationId, draft);
      setMessageDrafts((prev) => ({
        ...prev,
        [applicationId]: ""
      }));
      await refreshData();
      setMessageSuccess(response.message);
      setExpandedApplicationId(applicationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      setPageError(message);
    } finally {
      setSendingMessageForId(null);
    }
  };

  const handleSendDeadlineReminder = async (applicationId: number) => {
    setSendingDeadlineReminderForId(applicationId);
    setPageError("");
    setMessageSuccess("");

    try {
      const response = await sendAgentDeadlineReminder(applicationId);
      await refreshData();
      setMessageSuccess(response.message);
      setExpandedApplicationId(applicationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send deadline reminder";
      setPageError(message);
    } finally {
      setSendingDeadlineReminderForId(null);
    }
  };

  if (loading || !user) {
    return <p className="p-6">Loading...</p>;
  }

  const mustChangePassword = Boolean(user.must_change_password);

  return (
  <div className="min-h-[calc(100vh-88px)] bg-slate-100">
 <aside className="fixed left-0 top-[136px] h-[calc(100vh-136px)] w-72 overflow-y-auto bg-slate-900 text-white shadow-xl flex flex-col z-30">
  <div className="h-full overflow-y-auto">
    <div className="px-8 py-7 border-b border-white/10">
      <h1 className="text-2xl font-bold">Agent workspace</h1>
    </div>

    <nav className="p-5 space-y-3">
      <button
        onClick={() => setActiveTab("overview")}
        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-left transition ${
          activeTab === "overview"
            ? "bg-blue-600 text-white"
            : "text-slate-200 hover:bg-white/10"
        }`}
      >
        <LayoutDashboard size={20} />
        <span className="text-lg font-medium">Overview</span>
      </button>

      <button
        onClick={() => setActiveTab("scholarships")}
        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-left transition ${
          activeTab === "scholarships"
            ? "bg-blue-600 text-white"
            : "text-slate-200 hover:bg-white/10"
        }`}
        disabled={mustChangePassword}
      >
        <BookOpen size={20} />
        <span className="text-lg font-medium">Scholarships</span>
      </button>

      <button
        onClick={() => setActiveTab("applications")}
        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-left transition ${
          activeTab === "applications"
            ? "bg-blue-600 text-white"
            : "text-slate-200 hover:bg-white/10"
        }`}
        disabled={mustChangePassword}
      >
        <FileText size={20} />
        <span className="text-lg font-medium">Applications</span>
      </button>

      <button
        onClick={handleLogout}
        className="mt-8 w-full text-left px-6 py-4 rounded-2xl text-red-300 hover:bg-red-500/10 transition"
      >
        <span className="text-lg font-medium">Logout</span>
      </button>
    </nav>
  </div>
</aside>

    <main className="ml-80 p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}</h2>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
            <p className="text-sm font-medium text-slate-800">{user.email}</p>
            <p className="text-xs text-slate-500 mt-1">
              Assigned Country: {user.country?.name || "Not assigned"}
            </p>
          </div>
        </div>

        {pageError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {pageError}
          </div>
        )}
        {messageSuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
            {messageSuccess}
          </div>
        )}

        {mustChangePassword ? (
          <div className="max-w-2xl bg-white rounded-3xl shadow-md p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-blue-600" size={24} />
              <h3 className="text-2xl font-bold text-slate-900">Change Primary Password</h3>
            </div>

            <p className="text-slate-600 mb-6">
              You logged in with the primary password created by the admin. Please change it now before managing scholarships or student applications.
            </p>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
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
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={submittingPassword}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {submittingPassword ? "Updating password..." : "Change Password"}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="text-blue-600" size={22} />
                  <h3 className="text-lg font-bold text-slate-900">Assigned Country</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{user.country?.name || "Not assigned"}</p>
                <p className="text-sm text-slate-500 mt-2">All scholarship postings stay tied to this destination.</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="text-blue-600" size={22} />
                  <h3 className="text-lg font-bold text-slate-900">Active Scholarships</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats.activeScholarships}</p>
                <p className="text-sm text-slate-500 mt-2">Published opportunities students can browse now.</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-blue-600" size={22} />
                  <h3 className="text-lg font-bold text-slate-900">Open Applications</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats.openApplications}</p>
                <p className="text-sm text-slate-500 mt-2">Submitted, under review, or waiting for more documents.</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="text-blue-600" size={22} />
                  <h3 className="text-lg font-bold text-slate-900">Upcoming Deadlines</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats.upcomingDeadlines}</p>
                <p className="text-sm text-slate-500 mt-2">Active scholarships with deadlines still ahead.</p>
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-slate-900">Recent Applications</h3>
                    <button
                      onClick={() => setActiveTab("applications")}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Open application board
                    </button>
                  </div>

                  {applications.length === 0 ? (
                    <p className="text-slate-500">No applications yet. Once students apply, they will appear here.</p>
                  ) : (
                    <div className="space-y-4">
                      {applications.slice(0, 4).map((application) => {
                        const meta = statusMeta(application.status);

                        return (
                          <div key={application.id} className="rounded-2xl border border-slate-200 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h4 className="font-semibold text-slate-900">{application.student?.name}</h4>
                                <p className="text-sm text-slate-600">{application.scholarship?.title} · {application.scholarship?.university_name}</p>
                                <p className="text-xs text-slate-500 mt-1">Submitted {formatDateTime(application.submitted_at)}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${meta.className}`}>
                                {meta.icon} {meta.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-slate-900">Posting Quality Tips</h3>
                    <button
                      onClick={() => setActiveTab("scholarships")}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Manage scholarships
                    </button>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3 text-sm text-slate-600">
                    <p>Use clear scholarship titles and exact university names.</p>
                    <p>Add a complete required document checklist so students know exactly what to upload.</p>
                    <p>Use the message thread inside each application to request missing items or answer student questions.</p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "scholarships" && (
              <div className="space-y-6">
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {editingScholarshipId ? "Edit Scholarship" : "Post New Scholarship"}
                      </h3>
                      <p className="text-slate-600 mt-1">All scholarships posted here are automatically tied to {user.country?.name || "your assigned country"}.</p>
                    </div>

                    {editingScholarshipId && (
                      <button
                        type="button"
                        onClick={resetScholarshipForm}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>

                  {formError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {formSuccess}
                    </div>
                  )}

                  <form onSubmit={handleScholarshipSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Scholarship Title</label>
                        <input
                          value={scholarshipForm.title}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, title: e.target.value })}
                          placeholder="Example: International Excellence Scholarship"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">University Name</label>
                        <input
                          value={scholarshipForm.university_name}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, university_name: e.target.value })}
                          placeholder="Example: University of Toronto"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Degree Level</label>
                        <select
                          value={scholarshipForm.degree_level}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, degree_level: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Bachelor">Bachelor</option>
                          <option value="Master">Master</option>
                          <option value="PhD">PhD</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Any level">Any level</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Funding Type</label>
                        <select
                          value={scholarshipForm.funding_type}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, funding_type: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Fully funded">Fully funded</option>
                          <option value="Partial scholarship">Partial scholarship</option>
                          <option value="Tuition waiver">Tuition waiver</option>
                          <option value="Stipend">Stipend</option>
                          <option value="Grant">Grant</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Scholarship Amount / Coverage</label>
                        <input
                          value={scholarshipForm.amount}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })}
                          placeholder="Example: Full tuition + living stipend"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Application Deadline</label>
                        <input
                          type="date"
                          value={scholarshipForm.deadline}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Intake / Semester</label>
                        <input
                          value={scholarshipForm.intake}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, intake: e.target.value })}
                          placeholder="Example: Fall 2026"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Listing Status</label>
                        <select
                          value={scholarshipForm.status}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, status: e.target.value as ScholarshipPayload["status"] })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ListChecks size={18} className="text-blue-600" />
                        <h4 className="text-lg font-bold text-slate-900">Required Documents</h4>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">Add the exact documents students must upload. This list will appear directly on the student application form.</p>

                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                        <input
                          value={documentInput}
                          onChange={(e) => setDocumentInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addRequiredDocument();
                            }
                          }}
                          placeholder="Example: Passport copy"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => addRequiredDocument()}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                        >
                          <Plus size={16} /> Add document
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {scholarshipForm.required_documents.map((item) => (
                          <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2 text-sm text-slate-700">
                            {item}
                            <button type="button" onClick={() => removeRequiredDocument(item)} className="text-slate-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {[
                          "Passport copy",
                          "Academic transcripts",
                          "English proficiency certificate",
                          "CV / Resume",
                          "Recommendation letters",
                          "Statement of purpose"
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => addRequiredDocument(preset)}
                            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Scholarship Description</label>
                      <textarea
                        value={scholarshipForm.description}
                        onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })}
                        placeholder="Describe the scholarship benefits, who it is for, and the main opportunity"
                        className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Eligibility Requirements</label>
                        <textarea
                          value={scholarshipForm.eligibility}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, eligibility: e.target.value })}
                          placeholder="Minimum GPA, language score, academic background, or other conditions"
                          className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Application Instructions</label>
                        <textarea
                          value={scholarshipForm.application_instructions}
                          onChange={(e) => setScholarshipForm({ ...scholarshipForm, application_instructions: e.target.value })}
                          placeholder="Any extra instructions students should follow before applying"
                          className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={submittingScholarship}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                      >
                        <Save size={18} />
                        {submittingScholarship ? "Saving..." : editingScholarshipId ? "Update Scholarship" : "Publish Scholarship"}
                      </button>
                    </div>
                  </form>
                </section>

                <section className="space-y-4">
                  {scholarships.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                      No scholarships posted yet. Use the form above to publish the first one.
                    </div>
                  ) : (
                    scholarships.map((scholarship) => (
                      <article key={scholarship.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scholarship.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                                {scholarship.status}
                              </span>
                              <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                                {scholarship.degree_level}
                              </span>
                              <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">
                                Deadline {formatDate(scholarship.deadline)}
                              </span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">{scholarship.title}</h4>
                            <p className="text-slate-600 mt-1">{scholarship.university_name} · {scholarship.country?.name}</p>
                            <p className="text-slate-600 mt-4 leading-7">{scholarship.description}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => startEditScholarship(scholarship)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <PencilLine size={16} /> Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <p className="text-slate-500">Funding</p>
                            <p className="mt-1 font-semibold text-slate-900">{scholarship.funding_type}{scholarship.amount ? ` · ${scholarship.amount}` : ""}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <p className="text-slate-500">Intake</p>
                            <p className="mt-1 font-semibold text-slate-900">{scholarship.intake || "Not specified"}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <p className="text-slate-500">Applications received</p>
                            <p className="mt-1 font-semibold text-slate-900">{scholarship.applications_count ?? 0}</p>
                          </div>
                        </div>

                        {(scholarship.required_documents || []).length > 0 && (
                          <div className="mt-5">
                            <p className="text-sm font-semibold text-slate-900 mb-2">Required Documents</p>
                            <div className="flex flex-wrap gap-2">
                              {(scholarship.required_documents || []).map((item) => (
                                <span key={item} className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    ))
                  )}
                </section>
              </div>
            )}

            {activeTab === "applications" && (
              <section className="space-y-4">
                {applications.length === 0 ? (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                    No student applications have arrived yet.
                  </div>
                ) : (
                  applications.map((application) => {
                    const meta = statusMeta(application.status);
                    const draft = applicationDrafts[application.id] || {
                      status: application.status,
                      agent_note: application.agent_note || ""
                    };
                    const isExpanded = expandedApplicationId === application.id;

                    return (
                      <article key={application.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${meta.className}`}>
                                {meta.icon} {meta.label}
                              </span>
                              <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium">
                                Submitted {formatDateTime(application.submitted_at)}
                              </span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">{application.student?.name}</h4>
                            <p className="text-slate-600 mt-1">{application.student?.email}</p>
                            <p className="text-slate-600 mt-1">
                              {application.scholarship?.title} · {application.scholarship?.university_name} · {application.scholarship?.country?.name}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                              Phone: {application.student?.student_profile?.phone || "N/A"} · Address: {application.student?.student_profile?.address || "N/A"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedApplicationId(isExpanded ? null : application.id)}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            {isExpanded ? "Hide Details" : "Open Details"}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-6 space-y-5">
                            {application.message && (
                              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <p className="text-sm font-semibold text-slate-900 mb-1">Student introduction</p>
                                <p className="text-sm leading-7 text-slate-600">{application.message}</p>
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-semibold text-slate-900 mb-2">Uploaded Documents</p>
                              {application.documents.length === 0 ? (
                                <p className="text-sm text-slate-500">No documents uploaded.</p>
                              ) : (
                                <div className="flex flex-wrap gap-3">
                                  {application.documents.map((document) => (
                                    <button
                                      key={document.id}
                                      type="button"
                                      onClick={() => downloadApplicationDocument(document.id, document.original_name)}
                                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                      <Download size={16} /> {document.original_name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_auto_auto] gap-4 items-start">
                              <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Application Status</label>
                                <select
                                  value={draft.status}
                                  onChange={(e) => handleApplicationDraftChange(application.id, "status", e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="submitted">Submitted</option>
                                  <option value="under_review">Under review</option>
                                  <option value="needs_documents">Needs documents</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Agent Note</label>
                                <textarea
                                  value={draft.agent_note}
                                  onChange={(e) => handleApplicationDraftChange(application.id, "agent_note", e.target.value)}
                                  placeholder="Add a status note, review summary, or short instruction for the student"
                                  className="w-full min-h-[110px] px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleApplicationUpdate(application.id)}
                                disabled={savingApplicationId === application.id}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 mt-7"
                              >
                                <Save size={16} /> {savingApplicationId === application.id ? "Saving..." : "Save"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSendDeadlineReminder(application.id)}
                                disabled={sendingDeadlineReminderForId === application.id}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-60 mt-7"
                              >
                                <Bell size={16} /> {sendingDeadlineReminderForId === application.id ? "Sending..." : "Send Deadline Reminder"}
                              </button>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                              <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="text-blue-600" size={18} />
                                <h4 className="text-lg font-bold text-slate-900">Message Thread</h4>
                              </div>
                              <p className="text-sm text-slate-500 mb-4">Use this thread to answer questions, request missing documents, or guide the student step by step.</p>

                              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                                {application.messages.length === 0 ? (
                                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                                    No messages yet. Send the first message to start the conversation.
                                  </div>
                                ) : (
                                  application.messages.map((item) => (
                                    <ChatMessageBubble key={item.id} item={item} currentUserId={user.id} />
                                  ))
                                )}
                              </div>

                              <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                                <textarea
                                  value={messageDrafts[application.id] || ""}
                                  onChange={(e) => setMessageDrafts((prev) => ({ ...prev, [application.id]: e.target.value }))}
                                  placeholder={draft.status === "needs_documents" ? "Tell the student exactly which documents are missing" : "Write a message to the student"}
                                  className="min-h-[110px] px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSendMessage(application.id)}
                                  disabled={sendingMessageForId === application.id}
                                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                                >
                                  <Send size={16} /> {sendingMessageForId === application.id ? "Sending..." : "Send Message"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}