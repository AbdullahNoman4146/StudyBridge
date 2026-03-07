import {
  GraduationCap,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function LandingFooter() {
  return (
    <footer
      id="contact"
      className="mt-16 bg-[#07142d] px-8 pb-10 pt-16 text-white"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col justify-between gap-12 border-b border-white/10 pb-12 lg:flex-row">
          <div className="max-w-[760px]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
                <GraduationCap className="h-8 w-8 text-blue-500" strokeWidth={2.1} />
              </div>

              <span className="text-[2.2rem] font-bold tracking-[-0.02em]">
                StudyBridge
              </span>
            </div>

            <p className="mt-8 text-[1.5rem] leading-[1.9] text-slate-300">
              Your trusted partner in student consultancy operations. Empowering
              education consultants worldwide.
            </p>
          </div>

          <div>
            <h3 className="text-[2.1rem] font-bold">Contact</h3>

            <div className="mt-8 flex items-center gap-6">
              <a
                href="mailto:studybridge@example.com"
                className="footer-icon-link"
                aria-label="Email"
              >
                <Mail className="h-8 w-8" />
              </a>

              <a href="#" className="footer-icon-link" aria-label="Facebook">
                <Facebook className="h-8 w-8" />
              </a>

              <a href="#" className="footer-icon-link" aria-label="Instagram">
                <Instagram className="h-8 w-8" />
              </a>

              <a href="#" className="footer-icon-link" aria-label="Twitter">
                <Twitter className="h-8 w-8" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-10 text-[1.2rem] text-slate-300 xl:flex-row xl:items-center xl:justify-between">
          <p className="leading-relaxed">
            Copyright © 2026 StudyBridge - Student Consultancy Operations Platform.
            All Rights Reserved | Academic Project
          </p>

          <div className="flex flex-wrap gap-8">
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="transition hover:text-white">
              Code of Conduct
            </a>
            <a href="#" className="transition hover:text-white">
              Security Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}