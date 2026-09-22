import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_BASE_URL } from "../../config/api";
import { ArrowRight } from "lucide-react";
import heroImage from "../../assets/hero.png";

type HeroContent = { eyebrow: string; title: string; description: string; ctaLabel: string; ctaHref: string };
const defaultContent: HeroContent = { eyebrow: "Tradition · Comfort · Elegance", title: "Little girls, timeless traditions.", description: "Discover beautiful South Indian traditional wear crafted for little girls, from everyday cottons to festive pattu styles.", ctaLabel: "Shop Collection", ctaHref: "/shop" };

function Hero() {
  const [content, setContent] = useState<HeroContent>(defaultContent);
  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/content/hero`);
        const result = await response.json();
        if (response.ok && result.success) setContent({ ...defaultContent, ...result.data });
      } catch { /* retain local defaults when the CMS is unavailable */ }
    })();
  }, []);
  return (
    <section className="relative overflow-hidden bg-[#24160f]">
      <div className="relative min-h-[520px] w-full sm:min-h-[580px] lg:min-h-[620px]">
        {/* Hero Image */}
        <img
          src={heroImage}
          alt="Traditional South Indian girlswear collection"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Simple, softer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#24160f]/95 via-[#24160f]/62 to-[#24160f]/10" />

        {/* Subtle bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B0B0B]/45 to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-[460px] max-w-7xl items-center px-5 py-14 sm:min-h-[520px] sm:px-8 lg:min-h-[560px] lg:px-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f6d77c]/35 bg-[#24160f]/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f6d77c] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f6d77c]" />
              New festive edit
            </div>

            {/* Eyebrow */}
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f6d77c] sm:text-xs">
              {content.eyebrow}
            </p>

            {/* Heading */}
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.03] tracking-[-0.035em] text-[#fffaf1] sm:text-5xl lg:text-6xl">
              Little girls,
              <span className="mt-1 block text-[#f6d77c]">
                timeless traditions.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-md text-sm leading-7 text-[#FFF9ED]/75 sm:text-base">
              Discover beautiful South Indian traditional wear
              crafted for little girls, from everyday cottons to
              festive pattu styles.
            </p>

            {/* Primary actions */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={content.ctaHref}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f6d77c] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#24160f] shadow-[0_8px_24px_rgba(246,215,124,0.18)] transition hover:bg-[#fff0bf]"
              >
                {content.ctaLabel}

                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/shop?category=Pattu%20Frocks"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#fffaf1]/45 bg-[#24160f]/10 px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#fffaf1] backdrop-blur-sm transition hover:border-[#f6d77c] hover:text-[#f6d77c]"
              >
                Explore Pattu

                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center gap-6 border-t border-[#FFF9ED]/15 pt-5">
              <div>
                <p className="text-base font-semibold text-[#D4AF37]">
                  100+
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[#FFF9ED]/55">
                  Happy Customers
                </p>
              </div>

              <div className="h-7 w-px bg-[#FFF9ED]/15" />

              <div>
                <p className="text-base font-semibold text-[#D4AF37]">
                  7 Days
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[#FFF9ED]/55">
                  Easy Returns
                </p>
              </div>
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
