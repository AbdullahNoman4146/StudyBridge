import {
  Users,
  FileText,
  Globe,
  FolderOpen,
  BellRing,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Student Management",
    description:
      "Centralized database to manage all student profiles, track their progress, and maintain detailed records in one place.",
    icon: Users,
  },
  {
    title: "Application Tracking",
    description:
      "Monitor application status through every stage with visual pipelines and automated workflow management.",
    icon: FileText,
  },
  {
    title: "Visa Coordination",
    description:
      "Manage country-specific visa requirements, track deadlines, and coordinate documentation for multiple destinations.",
    icon: Globe,
  },
  {
    title: "Document Center",
    description:
      "Secure document storage and management system with version control and easy access for all stakeholders.",
    icon: FolderOpen,
  },
  {
    title: "Real-time Updates",
    description:
      "Stay informed with instant notifications and real-time status updates across all operations and workflows.",
    icon: BellRing,
  },
  {
    title: "Role-based Access",
    description:
      "Secure platform with customized access levels for admins, agents, and students to protect sensitive information.",
    icon: ShieldCheck,
  },
];

export default function FeaturesSection() {
  return (
    <section id="about" className="scroll-mt-28 px-8 py-12">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="mb-16 text-center text-[3.5rem] font-extrabold leading-tight tracking-[-0.03em] text-slate-900">
          Everything You Need to Manage Student Operations
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-[28px] border border-slate-200 bg-white p-10 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.09)]"
              >
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[22px] bg-blue-50">
                  <Icon className="h-10 w-10 text-blue-600" strokeWidth={2.1} />
                </div>

                <h3 className="text-[2rem] font-bold tracking-[-0.02em] text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-5 text-[1.35rem] leading-[1.8] text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}