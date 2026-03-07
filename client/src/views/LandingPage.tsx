import "../styles/landing.css";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import DestinationsSection from "../components/landing/DestinationsSection";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-[#eff1f4] text-slate-900">
      <LandingNavbar />
      <main>
        <HeroSection />
        <AboutSection />
        <DestinationsSection />
      </main>
      <LandingFooter />
    </div>
  );
}