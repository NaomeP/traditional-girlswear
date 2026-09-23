import { Link } from "react-router";

function BrandStory() {
  return (
    <section className="bg-[#F7F3EA] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-14">

        {/* Our Story Image */}
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#EDE7D9] lg:aspect-[4/5] lg:rounded-3xl">
            <img
              src="/images/story/our-story.jpg"
              decoding="async"
              alt="Our traditional girlswear story"
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 hover:scale-105"
            />
          </div>

          <div className="absolute -bottom-3 -right-3 h-20 w-20 border-b border-r border-[#C9A227] sm:-bottom-5 sm:-right-5 sm:h-28 sm:w-28" />
        </div>

        {/* Content */}
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">
            Our Story
          </p>

          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-[#0B0B0B] sm:text-4xl">
            Tradition made for
            <span className="block text-[#C9A227]">
              little moments.
            </span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#0B0B0B]/65 sm:text-base sm:leading-8">
            We believe traditional clothing should feel as beautiful as the
            memories created while wearing it. Our collection brings together
            comfortable fabrics, graceful details and timeless South Indian
            styles for little girls.
          </p>

          <p className="mt-3 text-sm leading-7 text-[#0B0B0B]/65 sm:mt-5 sm:text-base sm:leading-8">
            From everyday cotton frocks to festive pattu pavadai, each style
            is chosen to celebrate childhood while keeping tradition close.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center border-b border-[#0B0B0B] pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#0B0B0B] transition hover:border-[#C9A227] hover:text-[#C9A227]"
          >
            Discover the Collection →
          </Link>
        </div>

      </div>
    </section>
  );
}

export default BrandStory;
