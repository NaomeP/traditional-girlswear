import { HeartHandshake, Ruler, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: Sparkles,
    title: "Made for little moments",
    description: "Festive details with an easy, playful feel.",
  },
  {
    icon: Ruler,
    title: "A fit for every chapter",
    description: "Thoughtful styles from newborn through 10 years.",
  },
  {
    icon: HeartHandshake,
    title: "Easy returns",
    description: "A seven-day return window for extra peace of mind.",
  },
];

export default function HomeHighlights() {
  return (
    <section className="relative z-20 -mt-5 px-4 sm:-mt-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-[#c99b4a]/20 bg-[#fffaf1] shadow-[0_18px_45px_rgba(53,35,18,0.13)] md:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className={`flex gap-3 px-4 py-3.5 sm:px-5 sm:py-4 ${
              index > 0 ? "border-t border-[#24160f]/10 md:border-l md:border-t-0" : ""
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8e8bd] text-[#9b6021]">
              <Icon size={19} strokeWidth={1.7} />
            </span>
            <div>
              <h2 className="font-serif text-base font-semibold text-[#24160f]">
                {title}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#24160f]/60">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
