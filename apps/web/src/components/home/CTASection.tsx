import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { HomePageContent } from "../../services/homePageService";

function CTASection({ content }: { content: HomePageContent["cta"] }) {
  return (
    <section className="bg-[#F7F3EA] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden bg-[#0B0B0B] px-6 py-16 text-center sm:px-12 sm:py-20 lg:px-20">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full border border-[#D4AF37]/20" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full border border-[#D4AF37]/20" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              {content.eyebrow}
            </p>

            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-[#FFF9ED] sm:text-4xl lg:text-5xl">
              {content.title}
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#FFF9ED]/65 sm:text-base">
              {content.description}
            </p>

            <Link
              to={content.buttonHref}
              className="mt-8 inline-flex items-center gap-3 bg-[#D4AF37] px-7 py-3.5 text-sm font-semibold text-[#0B0B0B] transition hover:bg-[#C9A227]"
            >
              {content.buttonLabel}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
