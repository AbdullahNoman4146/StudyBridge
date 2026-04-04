import type { ReactNode } from "react";

import "../../styles/landing.css";
import HeroSection from "../landing/HeroSection";
import AboutSection from "../landing/AboutSection";
import DestinationsSection from "../landing/DestinationsSection";

type AuthPageShellProps = {
  children: ReactNode;
};

export default function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="relative min-h-[calc(100vh-88px)] overflow-hidden bg-[#eff1f4]">
      {/* Blurred landing background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="landing-page min-h-full scale-[1.03] blur-[10px] opacity-70">
          <main>
            <HeroSection />
            <AboutSection />
            <DestinationsSection />
          </main>
        </div>

        {/* Soft white overlay for readability */}
        <div className="absolute inset-0 bg-white/35 backdrop-brightness-[1.02]" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-4 py-10 sm:p-8">
        {children}
      </div>
    </div>
  );
}