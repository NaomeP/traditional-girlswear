import { Link } from "react-router";

function BrandStory() {
  return (
    <section className="bg-[#F7F3EA] px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">

        {/* Our Story Image */}
        <div className="relative overflow-hidden">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-[#EDE7D9]">
            <img
              src="/images/story/our-story.jpg"
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

          <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-[#0B0B0B] sm:text-4xl lg:text-5xl">
            Tradition made for
            <span className="block text-[#C9A227]">
              little moments.
            </span>
          </h2>

          <p className="mt-6 text-base leading-8 text-[#0B0B0B]/65">
            We believe traditional clothing should feel as beautiful as the
            memories created while wearing it. Our collection brings together
            comfortable fabrics, graceful details and timeless South Indian
            styles for little girls.
          </p>

          <p className="mt-5 text-base leading-8 text-[#0B0B0B]/65">
            From everyday cotton frocks to festive pattu pavadai, each style
            is chosen to celebrate childhood while keeping tradition close.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center border-b border-[#0B0B0B] pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#0B0B0B] transition hover:border-[#C9A227] hover:text-[#C9A227]"
          >
            Discover the Collection →
          </Link>
        </div>

      </div>
    </section>
  );
}

export default BrandStory;
