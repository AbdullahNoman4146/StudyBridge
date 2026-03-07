import { BadgeCheck, FolderKanban, Globe2, Users2 } from "lucide-react";

export default function VisionSection() {
  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-600 to-blue-500 px-10 py-14 text-white shadow-[0_20px_60px_rgba(37,99,235,0.22)] lg:px-14 lg:py-16">
          <h1 className="text-[2.8rem] font-extrabold leading-tight tracking-[-0.03em] md:text-[3.4rem] xl:text-[4rem]">
            Our Vision & Platform Value
          </h1>

          <p className="mt-8 max-w-[1250px] text-[1.2rem] leading-[2] text-blue-50 md:text-[1.35rem]">
            StudyBridge is built to transform how student consultancies manage their
            daily operations. Instead of relying on scattered spreadsheets, chat
            threads, and disconnected document storage, the platform brings student
            records, application workflow, document handling, and visa coordination
            into one structured system.
          </p>

          <p className="mt-8 max-w-[1250px] text-[1.2rem] leading-[2] text-blue-50 md:text-[1.35rem]">
            Our goal is to help admins, agents, and students collaborate more
            clearly, reduce delays, maintain better visibility across every case,
            and deliver a more professional end-to-end admission experience.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="vision-pill">
              <Users2 className="h-5 w-5" />
              <span>Student-centric workflow</span>
            </div>

            <div className="vision-pill">
              <FolderKanban className="h-5 w-5" />
              <span>Organized application pipeline</span>
            </div>

            <div className="vision-pill">
              <Globe2 className="h-5 w-5" />
              <span>Visa process visibility</span>
            </div>

            <div className="vision-pill">
              <BadgeCheck className="h-5 w-5" />
              <span>Operational clarity and control</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}