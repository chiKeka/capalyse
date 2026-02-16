import Image from "next/image";

interface SidebarProps {
  sections: { name: string }[];
  currentSection: number;
  getSectionStatus: (sectionIndex: number) => "completed" | "active" | "upcoming";
}

/**
 * Sidebar navigation for the assessment modal.
 * @param sections List of section objects with name.
 * @param currentSection Index of the current section.
 * @param getSectionStatus Function to determine section status.
 */
export function Sidebar({ sections, currentSection, getSectionStatus }: SidebarProps) {
  return (
    <div className="lg:w-80 bg-primary-green-6 text-white py-8 px-3 md:px-9 max-md:hidden">
      <div className="flex items-center space-x-3 mb-8">
        <Image
          src={"/logo-white.png"}
          width={130.28}
          height={31.07}
          alt="capalyze"
          className="max-md:hidden"
        />
      </div>
      <div className="max-h-auto relative flex-col gap-6 flex overflow-hidden">
        <div className="absolute left-[11px] top-6 h-full w-px bg-white z-0 mb-0.5"></div>
        {sections.map((section, index) => {
          const status = getSectionStatus(index);
          return (
            <div
              key={section.name}
              className={`flex items-center md:space-x-3 rounded-lg cursor-pointer transition-colors relative ${
                status === "active" ? "" : ""
              }`}
            >
              <div className="bg-primary-green-6 py-0.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold border-2 pb-1 ${
                    status === "completed"
                      ? "border-primary-green-2 bg-primary-green-2 text-primary-green-6"
                      : status === "active"
                        ? "border-primary-green-2 text-primary-green-2"
                        : "border-bg text-bg"
                  }`}
                >
                  <span className="max-md:hidden">{"✓"}</span>
                  <span className="md:hidden">{index + 1}</span>
                </div>
              </div>
              <div className="flex-1 text-xs max-md:hidden">
                <div
                  className={status === "upcoming" ? "text-bg" : "text-primary-green-2 font-bold"}
                >
                  {section.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
