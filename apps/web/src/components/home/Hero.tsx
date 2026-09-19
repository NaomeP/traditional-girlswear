import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import heroImage from "../../assets/hero.png";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B0B0B]">
      <div className="relative min-h-[520px] w-full sm:min-h-[580px] lg:min-h-[620px]">
        {/* Hero Image */}
        <img
          src={heroImage}
          alt="Traditional South Indian girlswear collection"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Simple, softer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/90 via-[#0B0B0B]/55 to-[#0B0B0B]/10" />

        {/* Subtle bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B0B0B]/45 to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center px-5 py-16 sm:min-h-[580px] sm:px-8 lg:min-h-[620px] lg:px-12">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37] sm:text-xs">
              Tradition · Comfort · Elegance
            </p>

            {/* Heading */}
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#FFF9ED] sm:text-5xl lg:text-6xl">
              Little girls,
              <span className="mt-1 block text-[#D4AF37]">
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
                to="/shop"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B0B0B] transition hover:bg-[#E0C45A]"
              >
                Shop Collection

                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/shop?category=Pattu%20Frocks"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#FFF9ED]/45 bg-[#0B0B0B]/10 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFF9ED] backdrop-blur-sm transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
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