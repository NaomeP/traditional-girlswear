import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

function CTASection() {
  return (
    <section className="bg-[#F7F3EA] px-4 py-6 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-2xl bg-[#24160f] px-5 py-7 text-center sm:rounded-3xl sm:px-12 sm:py-14 lg:px-20 lg:py-16">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full border border-[#D4AF37]/20" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full border border-[#D4AF37]/20" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              Celebrate Every Little Moment
            </p>

            <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight tracking-tight text-[#FFF9ED] sm:mt-4 sm:text-4xl">
              Dress them in traditions they'll always remember.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-xs leading-5 text-[#FFF9ED]/65 sm:mt-5 sm:text-base sm:leading-7">
              Discover beautiful traditional girlswear made for festivals,
              celebrations, family gatherings, and precious childhood
              memories.
            </p>

            <Link
              to="/shop"
              className="btn-gold mt-4 sm:mt-6"
            >
              Shop Collection
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
