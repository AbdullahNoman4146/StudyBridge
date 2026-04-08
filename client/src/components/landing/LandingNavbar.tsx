import {
  ChevronDown,
  CircleUserRound,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api/auth";
import {
  clearAuthSession,
  getDashboardPath,
  getStoredRole,
  getStoredUser,
  subscribeToAuthChanges,
  type StoredUser
} from "../../helpers/authStorage";

interface NavLinkItem {
  label: string;
  href?: string;
  to?: string;
  active: boolean;
}

export default function LandingNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<StoredUser | null>(getStoredUser());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isHomePage = location.pathname === "/";
  const isAboutPage = location.pathname === "/about";
  const role = getStoredRole();
  const dashboardPath = getDashboardPath(role);

  useEffect(() => {
    const syncAuth = () => {
      setAuthUser(getStoredUser());
    };

    syncAuth();
    return subscribeToAuthChanges(syncAuth);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const studyGuideHref = isHomePage ? "#destinations" : "/#destinations";
  const contactHref = isHomePage ? "#contact" : "/#contact";

  const navLinks = useMemo<NavLinkItem[]>(
    () => [
      {
        label: "StudyGuide",
        href: studyGuideHref,
        active: location.hash === "#destinations"
      },
      {
        label: "About",
        to: "/about",
        active: isAboutPage
      },
      {
        label: "Contact",
        href: contactHref,
        active: location.hash === "#contact"
      }
    ],
    [contactHref, isAboutPage, location.hash, studyGuideHref]
  );

  const userInitial = authUser?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const isAuthenticated = Boolean(localStorage.getItem("token") && authUser);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthSession();
      setIsLoggingOut(false);
      navigate("/");
    }
  };

  const renderNavLinks = (mobile = false) =>
    navLinks.map((item) => {
      const baseClass = mobile
        ? "rounded-2xl px-4 py-3 text-base font-medium transition"
        : "relative text-[1.02rem] font-medium transition";

      const activeClass = item.active
        ? "text-slate-900"
        : "text-slate-600 hover:text-slate-900";

      if (item.to) {
        return (
          <Link key={item.label} to={item.to} className={`${baseClass} ${activeClass}`}>
            {item.label}
          </Link>
        );
      }

      return (
        <a key={item.label} href={item.href} className={`${baseClass} ${activeClass}`}>
          {item.label}
        </a>
      );
    });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 shadow-sm ring-1 ring-blue-100">
            <GraduationCap className="h-6 w-6 text-blue-600" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <span className="block truncate text-[1.45rem] font-bold tracking-[-0.02em] text-slate-900 sm:text-[1.7rem]">
              StudyBridge
            </span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">
              Student Consultancy Platform
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">{renderNavLinks()}</nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                aria-expanded={profileOpen}
                aria-label="Open user menu"
              >
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-sm">
                  {authUser?.name ? userInitial : <CircleUserRound className="h-5 w-5" />}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="max-w-[160px] truncate text-sm font-semibold text-slate-900">
                    {authUser?.name || "My Account"}
                  </p>
                  <p className="text-xs text-slate-500">{role || "Signed in"}</p>
                </div>

                <ChevronDown
                  className={`hidden h-4 w-4 text-slate-500 transition sm:block ${profileOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {authUser?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-slate-500">{authUser?.email || ""}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(dashboardPath);
                    }}
                    className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-4 w-4 text-blue-600" />
                    Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-2xl bg-blue-600 px-6 py-3 text-[0.98rem] font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)] transition hover:bg-blue-700 sm:inline-flex"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white/95 px-4 pb-4 pt-2 shadow-sm lg:hidden sm:px-6">
          <div className="flex flex-col gap-2">{renderNavLinks(true)}</div>

          {isAuthenticated ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {authUser?.name || "User"}
                  </p>
                  <p className="truncate text-xs text-slate-500">{authUser?.email || ""}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate(dashboardPath);
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)] transition hover:bg-blue-700"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}