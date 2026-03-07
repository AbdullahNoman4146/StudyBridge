import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="px-8 pb-28 pt-24">
      <div className="mx-auto max-w-[1200px] text-center">
        <h1 className="mx-auto max-w-[1100px] text-[4.5rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-slate-900">
          Student Consultancy Operations Platform
        </h1>

        <p className="mx-auto mt-10 max-w-[980px] text-[1.9rem] leading-[1.7] text-slate-600">
          Streamline your student consultancy operations with StudyBridge. Manage
          applications, track documents, and coordinate visa processes all in one
          powerful platform.
        </p>

        <div className="mt-14">
          <Link
            to="/register"
            className="inline-flex min-w-[230px] items-center justify-center rounded-3xl bg-blue-600 px-10 py-5 text-[1.35rem] font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Join Now
          </Link>
        </div>
      </div>
    </section>
  );
}