import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

const ageGroups = [
  {
    label: "Newborn",
    shortLabel: "NB",
    description: "First little traditions",
    age: "Newborn",
    displayAge: "0–3M",
  },
  {
    label: "Tiny Tots",
    shortLabel: "01",
    description: "Soft everyday styles",
    age: "0–2 Years",
    displayAge: "0–2Y",
  },
  {
    label: "Little Ones",
    shortLabel: "02",
    description: "Playful festive looks",
    age: "2–4 Years",
    displayAge: "2–4Y",
  },
  {
    label: "Growing Girls",
    shortLabel: "03",
    description: "Beautiful celebration wear",
    age: "4–6 Years",
    displayAge: "4–6Y",
  },
  {
    label: "Young Girls",
    shortLabel: "04",
    description: "Elegant traditional styles",
    age: "6–8 Years",
    displayAge: "6–8Y",
  },
  {
    label: "Big Girls",
    shortLabel: "05",
    description: "Timeless festive elegance",
    age: "8–10 Years",
    displayAge: "8–10Y",
  },
];

function AgeSection() {
  return (
    <section className="bg-[#FFF9ED] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C9A227] sm:text-xs">
              Shop by Age
            </p>

            <h2 className="mt-3 max-w-xl font-serif text-3xl font-semibold leading-tight tracking-tight text-[#24160f] sm:text-4xl">
              Beautiful traditions,
              <br />
              made for every age.
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-7 text-black/55 lg:ml-auto">
            From their very first celebrations to their growing years,
            discover thoughtfully chosen styles designed for every
            little milestone.
          </p>
        </div>

        {/* Age Journey */}
        <div className="mt-8 border-t border-black/15 sm:mt-10">
        {ageGroups.map((group) => (
            <Link
              key={group.age}
              to={`/shop?age=${encodeURIComponent(group.age)}`}
              className="group grid min-h-[76px] grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-black/10 transition-colors duration-300 hover:bg-[#F7F3EA] sm:min-h-[88px] sm:grid-cols-[70px_1fr_1fr_auto] sm:gap-5 lg:grid-cols-[80px_1fr_1fr_auto]"
            >
              {/* Number */}
              <div className="flex items-center justify-center self-stretch border-r border-black/10">
                <span className="text-xs font-semibold tracking-[0.18em] text-[#C9A227]">
                  {group.shortLabel}
                </span>
              </div>

              {/* Age */}
              <div>
                <p className="text-lg font-medium tracking-tight text-[#0B0B0B] transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
                  {group.label}
                </p>

                <p className="mt-1 text-xs text-black/40 sm:hidden">
                  {group.displayAge}
                </p>
              </div>

              {/* Description */}
              <div className="hidden sm:block">
                <p className="text-sm text-black/50">
                  {group.description}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                  {group.displayAge}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex h-9 w-9 items-center justify-center border border-black/10 transition-all duration-300 group-hover:border-[#C9A227] group-hover:bg-[#D4AF37]">
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Statement */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-6 text-black/40">
            Designed around childhood, comfort, and the timeless beauty
            of South Indian tradition.
          </p>

          <Link
            to="/shop"
            className="inline-flex w-fit items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0B0B0B] underline decoration-[#C9A227] decoration-1 underline-offset-8 transition hover:text-[#C9A227]"
          >
            Explore All Styles
            <ArrowUpRight size={15} strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AgeSection;
