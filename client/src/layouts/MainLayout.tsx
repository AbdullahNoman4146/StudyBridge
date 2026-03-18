import { Outlet } from "react-router-dom";
import LandingNavbar from "../components/landing/LandingNavbar";

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-[#eff1f4] text-slate-900">
            <LandingNavbar />
            <Outlet />
        </div>
    );
}