import "../styles/landing.css";

import LandingNavbar from "../components/landing/LandingNavbar";
import VisionSection from "../components/landing/VisionSection.tsx";
import FeaturesSection from "../components/landing/FeaturesSection";
import LandingFooter from "../components/landing/LandingFooter";

export default function AboutPage() {
  return (
    <div className="landing-page min-h-screen bg-[#eff1f4] text-slate-900">
      <LandingNavbar />
      <main>
        <VisionSection />
        <FeaturesSection />
      </main>
      <LandingFooter />
    </div>
  );
}