import { HeartHandshake, Ruler, Sparkles } from "lucide-react";
import type { HomePageContent } from "../../services/homePageService";

const icons = { sparkles: Sparkles, ruler: Ruler, heart: HeartHandshake };

export default function HomeHighlights({ items }: { items: HomePageContent["highlights"] }) {
  return (
    <section className="relative z-20 -mt-7 px-4 sm:-mt-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-[#c99b4a]/20 bg-[#fffaf1] shadow-[0_18px_45px_rgba(53,35,18,0.13)] md:grid-cols-3">
        {items.map(({ icon, title, description }, index) => {
          const Icon = icons[icon as keyof typeof icons] ?? Sparkles;
          return (
          <div
            key={title}
            className={`flex gap-4 px-5 py-5 sm:px-7 sm:py-6 ${
              index > 0 ? "border-t border-[#24160f]/10 md:border-l md:border-t-0" : ""
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8e8bd] text-[#9b6021]">
              <Icon size={19} strokeWidth={1.7} />
            </span>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#24160f]">
                {title}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#24160f]/60">
                {description}
              </p>
            </div>
          </div>
        )})}
      </div>
    </section>
  );
}
