import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import aboutImage from "../../assets/studybridge-about.png";

export default function AboutSection() {
  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-[36px] bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-10 lg:p-14">
          {/* Heading */}
          <div className="mx-auto max-w-[980px] text-center">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              About StudyBridge
            </div>

            <h2 className="mt-6 text-[2.6rem] font-extrabold leading-tight tracking-[-0.03em] text-slate-900 md:text-[3.2rem] lg:text-[3.8rem]">
              Built to simplify student consultancy operations from inquiry to visa completion
            </h2>
          </div>

          {/* Large image */}
          <div className="mt-10 overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <img
              src={aboutImage}
              alt="Students exploring global education opportunities with StudyBridge"
              className="h-[320px] w-full object-cover object-center transition duration-500 hover:scale-[1.02] md:h-[420px] lg:h-[540px]"
            />
          </div>

          {/* Short caption before buttons */}
          <div className="mx-auto mt-8 max-w-[900px] text-center">
            <p className="text-[1.1rem] leading-[1.9] text-slate-600 md:text-[1.2rem]">
              A unified platform to manage student records, application progress,
              documents, and visa workflows with more clarity, speed, and control.
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)] transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Get Started
            </Link>

            <a
              href="#destinations"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Explore Destinations
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}