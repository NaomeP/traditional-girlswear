import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import type { HomePageContent } from "../../services/homePageService";

function AgeSection({ content }: { content: HomePageContent["ages"] }) {
  return (
    <section className="bg-[#FFF9ED] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C9A227] sm:text-xs">
              {content.eyebrow}
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-[#0B0B0B] sm:text-4xl lg:text-5xl">
              {content.title}
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-7 text-black/55 lg:ml-auto">
            {content.description}
          </p>
        </div>

        {/* Age Journey */}
        <div className="mt-14 border-t border-black/15">
        {content.items.map((group, index) => (
            <Link
              key={`${group.age}-${index}`}
              to={`/shop?age=${encodeURIComponent(group.age)}`}
              className="group grid min-h-[108px] grid-cols-[60px_1fr_auto] items-center gap-4 border-b border-black/10 transition-colors duration-300 hover:bg-[#F7F3EA] sm:grid-cols-[90px_1fr_1fr_auto] sm:gap-6 lg:min-h-[120px] lg:grid-cols-[100px_1fr_1fr_auto]"
            >
              {/* Number */}
              <div className="flex items-center justify-center self-stretch border-r border-black/10">
                <span className="text-xs font-semibold tracking-[0.18em] text-[#C9A227]">
                  {group.shortLabel}
                </span>
              </div>

              {/* Age */}
              <div>
                <p className="text-xl font-medium tracking-tight text-[#0B0B0B] transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl lg:text-3xl">
                  {group.label}
                </p>

                <p className="mt-1 text-xs text-black/40 sm:hidden">
                  {group.age}
                </p>
              </div>

              {/* Description */}
              <div className="hidden sm:block">
                <p className="text-sm text-black/50">
                  {group.description}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                  {group.age}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex h-10 w-10 items-center justify-center border border-black/10 transition-all duration-300 group-hover:border-[#C9A227] group-hover:bg-[#D4AF37]">
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
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-6 text-black/40">
            {content.footer}
          </p>

          <Link
            to={content.linkHref}
            className="inline-flex w-fit items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0B0B0B] underline decoration-[#C9A227] decoration-1 underline-offset-8 transition hover:text-[#C9A227]"
          >
            {content.linkLabel}
            <ArrowUpRight size={15} strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AgeSection;
