import { GraduationCap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function LandingNavbar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAboutPage = location.pathname === "/about";

  const studyGuideHref = isHomePage ? "#destinations" : "/#destinations";
  const contactHref = isHomePage ? "#contact" : "/#contact";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <GraduationCap className="h-7 w-7 text-blue-600" strokeWidth={2.2} />
          </div>

          <span className="text-[2rem] font-bold tracking-[-0.02em] text-slate-900">
            StudyBridge
          </span>
        </Link>

        <nav className="hidden items-center gap-12 text-[1.2rem] font-medium md:flex">
          <a
            href={studyGuideHref}
            className="text-slate-600 transition hover:text-slate-900"
          >
            StudyGuide
          </a>

          <Link
            to="/about"
            className={`transition hover:text-slate-900 ${
              isAboutPage ? "text-slate-900" : "text-slate-600"
            }`}
          >
            About
          </Link>

          <a
            href={contactHref}
            className="text-slate-600 transition hover:text-slate-900"
          >
            Contact
          </a>
        </nav>

        <Link
          to="/login"
          className="rounded-2xl bg-blue-600 px-8 py-4 text-[1.1rem] font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}