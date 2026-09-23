import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_BASE_URL } from "../../config/api";
import { ArrowRight } from "lucide-react";

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
      <div className="relative bg-[#24160f] sm:min-h-[480px] lg:min-h-[540px]">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#24160f] sm:absolute sm:inset-0 sm:aspect-auto">
          <img
            src="/images/hero/home-hero.webp"
            fetchPriority="high"
            decoding="async"
            alt="Traditional South Indian girlswear collection"
            className="cinematic-hero-image absolute inset-0 h-full w-full object-contain sm:object-cover sm:object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#24160f]/35 via-transparent to-transparent sm:bg-gradient-to-r sm:from-[#24160f]/90 sm:via-[#24160f]/48 sm:to-[#24160f]/8" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_at_78%_44%,rgba(246,215,124,0.12),transparent_48%)] sm:block" />

          <div className="absolute inset-y-0 left-0 z-10 flex w-[70%] flex-col justify-center px-3 sm:hidden">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#8b541d]">
              {content.eyebrow}
            </p>
            <h1 className="mt-1.5 font-serif text-[clamp(1.1rem,5.5vw,1.4rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-[#24160f]">
              Little girls,
              <span className="mt-1 block text-[#8b541d]">timeless traditions.</span>
            </h1>
            <p className="mt-1.5 line-clamp-3 text-[9px] leading-3 text-[#24160f]/75">
              {content.description}
            </p>
            <Link
              to={content.ctaHref}
              className="mt-2.5 inline-flex h-8 w-fit items-center gap-2 rounded-full bg-[#24160f] px-3.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#fffaf1] shadow-sm"
            >
              {content.ctaLabel}
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="relative z-10 mx-auto hidden max-w-7xl items-center px-5 py-8 sm:flex sm:min-h-[480px] sm:px-8 sm:py-12 lg:min-h-[540px] lg:px-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f6d77c]/35 bg-[#24160f]/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f6d77c] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f6d77c]" />
              New festive edit
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f6d77c] sm:text-xs">
              {content.eyebrow}
            </p>

            <h1 className="mt-3 font-serif text-3xl font-semibold leading-[1.03] tracking-[-0.035em] text-[#fffaf1] sm:text-6xl lg:text-7xl">
              Little girls,
              <span className="mt-1 block text-[#f6d77c]">
                timeless traditions.
              </span>
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#FFF9ED]/75 sm:mt-5 sm:leading-7 sm:text-base">
              Discover beautiful South Indian traditional wear
              crafted for little girls, from everyday cottons to
              festive pattu styles.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to={content.ctaHref}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f6d77c] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#24160f] shadow-[0_8px_24px_rgba(246,215,124,0.18)] transition hover:bg-[#fff0bf]"
              >
                {content.ctaLabel}
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/shop?category=Pattu%20Frocks"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#fffaf1]/45 bg-[#24160f]/10 px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#fffaf1] backdrop-blur-sm transition hover:border-[#f6d77c] hover:text-[#f6d77c]"
              >
                Explore Pattu
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-5 flex items-center gap-6 border-t border-[#FFF9ED]/15 pt-4">
              <div>
                <p className="text-base font-semibold text-[#D4AF37]">100+</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[#FFF9ED]/55">Happy Customers</p>
              </div>
              <div className="h-7 w-px bg-[#FFF9ED]/15" />
              <div>
                <p className="text-base font-semibold text-[#D4AF37]">7 Days</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[#FFF9ED]/55">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-[#FFF9ED]/35 sm:flex">
          Scroll
          <span className="h-5 w-px bg-[#FFF9ED]/25" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
