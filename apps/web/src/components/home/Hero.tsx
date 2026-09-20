import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { HomePageContent } from "../../services/homePageService";

function Hero({ content }: { content: HomePageContent["hero"] }) {
  return (
    <section className="relative overflow-hidden bg-[#24160f]">
      <div className="relative min-h-[520px] w-full sm:min-h-[580px] lg:min-h-[620px]">
        {/* Hero Image */}
        <img
          src={content.imageUrl}
          alt={content.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Simple, softer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#24160f]/95 via-[#24160f]/62 to-[#24160f]/10" />

        {/* Subtle bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B0B0B]/45 to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center px-5 py-16 sm:min-h-[580px] sm:px-8 lg:min-h-[620px] lg:px-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f6d77c]/35 bg-[#24160f]/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f6d77c] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f6d77c]" />
              {content.badge}
            </div>

            {/* Eyebrow */}
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f6d77c] sm:text-xs">
              {content.eyebrow}
            </p>

            {/* Heading */}
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.03] tracking-[-0.035em] text-[#fffaf1] sm:text-5xl lg:text-6xl">
              {content.title}
              <span className="mt-1 block text-[#f6d77c]">
                {content.accentTitle}
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-md text-sm leading-7 text-[#FFF9ED]/75 sm:text-base">
              {content.description}
            </p>

            {/* Primary actions */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={content.primaryHref}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f6d77c] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#24160f] shadow-[0_8px_24px_rgba(246,215,124,0.18)] transition hover:bg-[#fff0bf]"
              >
                {content.primaryLabel}

                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to={content.secondaryHref}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#fffaf1]/45 bg-[#24160f]/10 px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#fffaf1] backdrop-blur-sm transition hover:border-[#f6d77c] hover:text-[#f6d77c]"
              >
                {content.secondaryLabel}

                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center gap-6 border-t border-[#FFF9ED]/15 pt-5">
              {content.stats.map((stat, index) => <div key={`${stat.label}-${index}`} className="flex items-center gap-6"><div><p className="text-base font-semibold text-[#D4AF37]">{stat.value}</p><p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[#FFF9ED]/55">{stat.label}</p></div>{index < content.stats.length - 1 && <div className="h-7 w-px bg-[#FFF9ED]/15" />}</div>)}
            </div>
          </div>
        </div>

        {/* Small scroll hint */}
        <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-[#FFF9ED]/35 sm:flex">
          Scroll
          <span className="h-5 w-px bg-[#FFF9ED]/25" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
