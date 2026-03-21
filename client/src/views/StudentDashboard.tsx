import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Globe,
  Upload,
  Download,
  CheckCircle2,
  Clock3,
  BadgeAlert,
  XCircle,
  FileText,
  Send,
  MessageSquare,
  Sparkles,
  FileCheck2,
  MessageCircleMore
} from "lucide-react";
import { getCountries, getCurrentUser, logout } from "../api/auth";
import {
  applyToScholarship,
  downloadApplicationDocument,
  getStudentApplications,
  getStudentScholarships,
  sendApplicationMessage,
  submitRequestedDocuments,
  type CountryOption,
  type Scholarship,
  type ScholarshipApplication,
  type ApplicationMessageItem
} from "../api/scholarships";
import { clearAuthSession } from "../helpers/authStorage";

type StudentTab = "browse" | "applications";

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

function mergeSelectedFiles(currentFiles: File[], incomingFiles: File[]) {
  const fileMap = new Map<string, File>();

  [...currentFiles, ...incomingFiles].forEach((file) => {
    fileMap.set(`${file.name}-${file.size}-${file.lastModified}`, file);
  });

  return Array.from(fileMap.values());
}

function ChatMessageBubble({ item, currentUserId }: { item: ApplicationMessageItem; currentUserId: number }) {
  const isMine = item.sender_id === currentUserId;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isMine ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800 border border-slate-200"}`}>
        <div className="flex items-center gap-2 text-xs mb-1 opacity-90">
          <span className="font-semibold">{item.sender?.name || (isMine ? "You" : "Agent")}</span>
          <span>•</span>
          <span>{formatDateTime(item.created_at)}</span>
        </div>
        <p className="text-sm leading-6 whitespace-pre-wrap">{item.message}</p>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StudentTab>("browse");
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [search, setSearch] = useState("");
  const [expandedScholarshipId, setExpandedScholarshipId] = useState<number | null>(null);
  const [expandedApplicationId, setExpandedApplicationId] = useState<number | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [pageError, setPageError] = useState("");
  const [messageSuccess, setMessageSuccess] = useState("");
  const [messageDrafts, setMessageDrafts] = useState<Record<number, string>>({});
  const [documentResponseDrafts, setDocumentResponseDrafts] = useState<Record<number, string>>({});
  const [selectedFilesByApplication, setSelectedFilesByApplication] = useState<Record<number, File[]>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [sendingMessageForId, setSendingMessageForId] = useState<number | null>(null);
  const [submittingDocumentsForId, setSubmittingDocumentsForId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [currentUser, countryOptions, scholarshipList, applicationList] = await Promise.all([
          getCurrentUser(),
          getCountries() as Promise<CountryOption[]>,
          getStudentScholarships(),
          getStudentApplications()
        ]);

        setUser(currentUser);
        setCountries(countryOptions);
        setScholarships(scholarshipList);
        setApplications(applicationList);
      } catch (error) {
        clearAuthSession();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [navigate]);

  const appliedScholarshipIds = useMemo(
    () => new Set(applications.map((application) => application.scholarship_id)),
    [applications]
  );

  const stats = useMemo(() => ({
    scholarships: scholarships.length,
    submittedApplications: applications.length,
    activeReviews: applications.filter((application) => ["submitted", "under_review", "needs_documents"].includes(application.status)).length
  }), [applications, scholarships]);

  const refreshScholarships = async (country = selectedCountry, searchTerm = search) => {
    const scholarshipList = await getStudentScholarships(country, searchTerm);
    setScholarships(scholarshipList);
  };

  const refreshApplications = async () => {
    const applicationList = await getStudentApplications();
    setApplications(applicationList);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthSession();
      navigate("/login");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError("");

    try {
      await refreshScholarships(selectedCountry, search);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load scholarships";
      setPageError(message);
    }
  };

  const handleApply = async (scholarshipId: number) => {
    setApplyError("");
    setApplySuccess("");
    setMessageSuccess("");

    if (selectedFiles.length === 0) {
      setApplyError("Please upload at least one document before applying.");
      return;
    }

    setIsApplying(true);

    try {
      const response = await applyToScholarship(scholarshipId, applicationMessage, selectedFiles);
      setApplySuccess(response.message);
      setApplicationMessage("");
      setSelectedFiles([]);
      setExpandedScholarshipId(null);
      await refreshApplications();
      await refreshScholarships();
      setActiveTab("applications");
      setExpandedApplicationId(response.application.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit application";
      setApplyError(message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleSendMessage = async (applicationId: number) => {
    const draft = (messageDrafts[applicationId] || "").trim();

    if (!draft) {
      setPageError("Please write a message before sending.");
      return;
    }

    setPageError("");
    setApplySuccess("");
    setMessageSuccess("");
    setSendingMessageForId(applicationId);

    try {
      const response = await sendApplicationMessage(applicationId, draft);
      setMessageDrafts((prev) => ({
        ...prev,
        [applicationId]: ""
      }));
      await refreshApplications();
      setMessageSuccess(response.message);
      setExpandedApplicationId(applicationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      setPageError(message);
    } finally {
      setSendingMessageForId(null);
    }
  };

  const handleSubmitRequestedDocuments = async (applicationId: number) => {
    const files = selectedFilesByApplication[applicationId] || [];
    const responseMessage = (documentResponseDrafts[applicationId] || "").trim();

    if (files.length === 0) {
      setPageError("Please select at least one document before submitting.");
      return;
    }

    setPageError("");
    setApplySuccess("");
    setMessageSuccess("");
    setSubmittingDocumentsForId(applicationId);

    try {
      const response = await submitRequestedDocuments(applicationId, responseMessage, files);
      setSelectedFilesByApplication((prev) => ({ ...prev, [applicationId]: [] }));
      setDocumentResponseDrafts((prev) => ({ ...prev, [applicationId]: "" }));
      await refreshApplications();
      setMessageSuccess(response.message);
      setExpandedApplicationId(applicationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit requested documents";
      setPageError(message);
    } finally {
      setSubmittingDocumentsForId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading student dashboard...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
            <p className="text-slate-600 mt-1">Explore scholarships, upload documents, and chat with your assigned agent inside each application.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-blue-600" size={22} />
              <h3 className="text-lg font-bold text-slate-900">Available Scholarships</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.scholarships}</p>
            <p className="text-sm text-slate-500 mt-2">Listings that match your current search and country filter.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck2 className="text-blue-600" size={22} />
              <h3 className="text-lg font-bold text-slate-900">My Applications</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.submittedApplications}</p>
            <p className="text-sm text-slate-500 mt-2">Applications you have submitted so far.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircleMore className="text-blue-600" size={22} />
              <h3 className="text-lg font-bold text-slate-900">Open Conversations</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.activeReviews}</p>
            <p className="text-sm text-slate-500 mt-2">Applications that are still active and may need communication.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-5 py-3 rounded-2xl font-medium transition ${activeTab === "browse" ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"}`}
          >
            Browse Scholarships
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-5 py-3 rounded-2xl font-medium transition ${activeTab === "applications" ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"}`}
          >
            My Applications
          </button>
        </div>

        {pageError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {pageError}
          </div>
        )}
        {applySuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
            {applySuccess}
          </div>
        )}
        {messageSuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
            {messageSuccess}
          </div>
        )}

        {activeTab === "browse" && (
          <>
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-6">
              <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-[1fr_240px_auto] gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by scholarship title, university, level, or funding"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full appearance-none pl-11 pr-4 py-3 rounded-2xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All countries</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Apply Filter
                </button>
              </form>
            </section>

            {applyError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {applyError}
              </div>
            )}

            <section className="space-y-5">
              {scholarships.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
                  No scholarships match your current search. Try a different keyword or country filter.
                </div>
              ) : (
                scholarships.map((scholarship) => {
                  const alreadyApplied = appliedScholarshipIds.has(scholarship.id);
                  const isExpanded = expandedScholarshipId === scholarship.id;

                  return (
                    <article key={scholarship.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                              {scholarship.degree_level}
                            </span>
                            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
                              {scholarship.funding_type}
                            </span>
                            <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">
                              Deadline {formatDate(scholarship.deadline)}
                            </span>
                          </div>

                          <h2 className="text-2xl font-bold text-slate-900">{scholarship.title}</h2>
                          <p className="text-slate-600 mt-1">{scholarship.university_name} · {scholarship.country?.name}</p>
                          <p className="text-slate-600 mt-4 leading-7">{scholarship.description}</p>
                        </div>

                        <div className="min-w-[220px] lg:text-right">
                          <p className="text-sm text-slate-500">Coverage</p>
                          <p className="text-lg font-bold text-slate-900">{scholarship.amount || "Not specified"}</p>
                          <p className="text-sm text-slate-500 mt-2">Intake</p>
                          <p className="font-medium text-slate-900">{scholarship.intake || "Not specified"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                          <p className="text-sm font-semibold text-slate-900 mb-2">Eligibility Requirements</p>
                          <p className="text-sm leading-7 text-slate-600">{scholarship.eligibility || "No specific eligibility notes were added by the agent."}</p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                          <p className="text-sm font-semibold text-slate-900 mb-2">Required Documents</p>
                          {(scholarship.required_documents || []).length === 0 ? (
                            <p className="text-sm text-slate-500">No required document list provided yet.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {(scholarship.required_documents || []).map((item) => (
                                <span key={item} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {scholarship.application_instructions && (
                        <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Application Instructions</p>
                          <p className="text-sm leading-7 text-blue-800">{scholarship.application_instructions}</p>
                        </div>
                      )}

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Handled by {scholarship.agent?.name || "assigned agent"}</p>
                          <p className="text-xs text-slate-400 mt-1">Students can continue chatting with the agent after submitting.</p>
                        </div>

                        {alreadyApplied ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("applications");
                              const matchingApplication = applications.find((item) => item.scholarship_id === scholarship.id);
                              setExpandedApplicationId(matchingApplication?.id || null);
                            }}
                            className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-medium hover:bg-slate-800"
                          >
                            Open My Application
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setApplyError("");
                              setApplySuccess("");
                              setExpandedScholarshipId(isExpanded ? null : scholarship.id);
                            }}
                            className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                          >
                            {isExpanded ? "Close Application Form" : "Apply Now"}
                          </button>
                        )}
                      </div>

                      {isExpanded && !alreadyApplied && (
                        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={18} className="text-blue-600" />
                            <h3 className="text-lg font-bold text-slate-900">Submit your application</h3>
                          </div>
                          <p className="text-sm text-slate-500 mb-4">Upload the required documents and optionally write a message for the agent. After applying, you can continue chatting from the My Applications tab.</p>

                          {(scholarship.required_documents || []).length > 0 && (
                            <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                              <p className="text-sm font-semibold text-blue-900 mb-2">Recommended document checklist</p>
                              <div className="flex flex-wrap gap-2">
                                {(scholarship.required_documents || []).map((item) => (
                                  <span key={item} className="rounded-full bg-white border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-900 mb-2">Message to agent</label>
                              <textarea
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
                                placeholder="Introduce yourself, mention your goals, or explain any important notes about the uploaded documents"
                                className="w-full min-h-[130px] px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-900 mb-2">Upload documents</label>
                              <label className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 cursor-pointer flex flex-col items-center justify-center text-center min-w-[220px] min-h-[130px]">
                                <Upload size={22} className="text-blue-600 mb-2" />
                                <span className="text-sm font-medium text-slate-900">Choose one or more files</span>
                                <span className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, DOC, DOCX · up to 10 files · you can add more in multiple selections</span>
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => {
                                    const incomingFiles = Array.from(e.target.files || []);
                                    setSelectedFiles((prev) => mergeSelectedFiles(prev, incomingFiles).slice(0, 10));
                                    e.currentTarget.value = "";
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          {selectedFiles.length > 0 && (
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                              <p className="text-sm font-semibold text-slate-900 mb-3">Selected documents ({selectedFiles.length})</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedFiles.map((file) => (
                                  <span key={`${file.name}-${file.size}-${file.lastModified}`} className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                                    {file.name}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedFiles((prev) => prev.filter((item) => `${item.name}-${item.size}-${item.lastModified}` !== `${file.name}-${file.size}-${file.lastModified}`))}
                                      className="text-slate-500 hover:text-red-600"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleApply(scholarship.id)}
                              disabled={isApplying}
                              className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                            >
                              {isApplying ? "Submitting..." : "Submit Application"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedScholarshipId(null);
                                setApplicationMessage("");
                                setSelectedFiles([]);
                              }}
                              className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </section>
          </>
        )}

        {activeTab === "applications" && (
          <section className="space-y-5">
            {applications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
                You have not submitted any scholarship applications yet.
              </div>
            ) : (
              applications.map((application) => {
                const meta = statusMeta(application.status);
                const isExpanded = expandedApplicationId === application.id;

                return (
                  <article key={application.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
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
                        <h3 className="text-xl font-bold text-slate-900">{application.scholarship?.title}</h3>
                        <p className="text-slate-600 mt-1">{application.scholarship?.university_name} · {application.scholarship?.country?.name}</p>
                        <p className="text-sm text-slate-500 mt-2">Agent: {application.scholarship?.agent?.name || "Assigned agent"}</p>
                      </div>

                      <div className="lg:text-right flex flex-col gap-3">
                        <div>
                          <p className="text-sm text-slate-500">Deadline</p>
                          <p className="font-semibold text-slate-900">{formatDate(application.scholarship?.deadline)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedApplicationId(isExpanded ? null : application.id)}
                          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          {isExpanded ? "Hide Details" : "Open Details"}
                        </button>
                      </div>
                    </div>

                    {application.agent_note && (
                      <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Agent Note</p>
                        <p className="text-sm leading-7 text-blue-800">{application.agent_note}</p>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="mt-6 space-y-5">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 mb-2">Uploaded Documents</p>
                          {application.documents.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                              No documents uploaded yet.
                            </div>
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

                        {application.status === "needs_documents" && (
                          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <BadgeAlert size={18} className="text-amber-700" />
                              <h4 className="text-lg font-bold text-amber-900">Additional documents requested</h4>
                            </div>

                            <p className="text-sm leading-7 text-amber-800">
                              Your agent has asked for more documents. Upload the missing files here and they will be added to this application immediately.
                            </p>

                            {(application.scholarship?.required_documents || []).length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-semibold text-amber-900 mb-2">Scholarship document checklist</p>
                                <div className="flex flex-wrap gap-2">
                                  {(application.scholarship?.required_documents || []).map((item) => (
                                    <span key={item} className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-800">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Response note for agent</label>
                                <textarea
                                  value={documentResponseDrafts[application.id] || ""}
                                  onChange={(e) => setDocumentResponseDrafts((prev) => ({ ...prev, [application.id]: e.target.value }))}
                                  placeholder="Mention which requested documents you are submitting or add any clarification for the agent"
                                  className="w-full min-h-[120px] px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Upload requested documents</label>
                                <label className="rounded-2xl border border-dashed border-amber-300 bg-white px-5 py-4 cursor-pointer flex flex-col items-center justify-center text-center min-w-[220px] min-h-[120px]">
                                  <Upload size={22} className="text-amber-700 mb-2" />
                                  <span className="text-sm font-medium text-slate-900">Add requested files</span>
                                  <span className="text-xs text-slate-500 mt-1">You can select files more than once. Maximum 10 files per submission.</span>
                                  <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                      const incomingFiles = Array.from(e.target.files || []);
                                      setSelectedFilesByApplication((prev) => ({
                                        ...prev,
                                        [application.id]: mergeSelectedFiles(prev[application.id] || [], incomingFiles).slice(0, 10)
                                      }));
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            {(selectedFilesByApplication[application.id] || []).length > 0 && (
                              <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4">
                                <p className="text-sm font-semibold text-slate-900 mb-3">
                                  Ready to submit ({(selectedFilesByApplication[application.id] || []).length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {(selectedFilesByApplication[application.id] || []).map((file) => (
                                    <span key={`${file.name}-${file.size}-${file.lastModified}`} className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-900">
                                      {file.name}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedFilesByApplication((prev) => ({
                                          ...prev,
                                          [application.id]: (prev[application.id] || []).filter((item) => `${item.name}-${item.size}-${item.lastModified}` !== `${file.name}-${file.size}-${file.lastModified}`)
                                        }))}
                                        className="text-amber-700 hover:text-red-600"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => handleSubmitRequestedDocuments(application.id)}
                                disabled={submittingDocumentsForId === application.id}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60"
                              >
                                <Upload size={16} /> {submittingDocumentsForId === application.id ? "Submitting..." : "Submit Requested Documents"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFilesByApplication((prev) => ({ ...prev, [application.id]: [] }));
                                  setDocumentResponseDrafts((prev) => ({ ...prev, [application.id]: "" }));
                                }}
                                className="px-5 py-3 rounded-2xl border border-amber-300 text-amber-900 hover:bg-white"
                              >
                                Clear Selection
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="text-blue-600" size={18} />
                            <h4 className="text-lg font-bold text-slate-900">Conversation with agent</h4>
                          </div>

                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {application.messages.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                                No messages yet. Start the conversation if you need clarification.
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
                              placeholder="Write a follow-up message to the agent"
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
      </div>
    </div>
  );
}