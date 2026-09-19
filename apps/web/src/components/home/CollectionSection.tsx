
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    title: "Cotton Frocks",
    description: "Soft, comfortable styles for everyday elegance.",
    image: "/images/products/traditional-cotton-frock.jpg",
    category: "Cotton Frocks",
  },
  {
    title: "Pattu Frocks",
    description: "Festive silhouettes crafted for special moments.",
    image: "/images/products/festive-pattu-frock.jpg",
    category: "Pattu Frocks",
  },
  {
    title: "Cotton Pavadai",
    description: "Timeless traditional comfort for little girls.",
    image: "/images/products/classic-cotton-pavadai.jpg",
    category: "Cotton Pavadai",
  },
  {
    title: "Pattu Pavadai",
    description: "Graceful festive dressing with a traditional touch.",
    image: "/images/products/festive-pattu-pavadai.jpg",
    category: "Pattu Pavadai",
  },
];

function CollectionSection() {
  return (
    <section className="relative overflow-hidden bg-[#FFF9ED] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* Decorative Background Elements */}
      <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-[#D4AF37]/5 blur-3xl" />

      <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#C9A227]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-lg">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#C9A227] animate-in fade-in slide-in-from-left-4 duration-500">
              Our Collections
            </p>

            <h2 className="text-3xl font-black tracking-tight text-[#0B0B0B] sm:text-4xl lg:text-5xl animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
              Featured Collections
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#0B0B0B]/60 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              Curated collections of traditional South Indian
              wear for every occasion and age group.
            </p>
          </div>

          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-[#0B0B0B] transition-all duration-300 hover:text-[#C9A227] animate-in fade-in slide-in-from-right-4 duration-700 delay-300"
          >
            View All Collections

            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-2"
            />
          </Link>
        </div>

        {/* Collection Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection, index) => (
            <Link
              key={collection.category}
              to={`/shop?category=${encodeURIComponent(
                collection.category,
              )}`}
              className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#F7F3EA] to-[#F0E8D8] shadow-lg transition-all duration-500 group-hover:shadow-2xl">
                {/* Image */}
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/95 via-[#0B0B0B]/40 to-transparent transition-all duration-500 group-hover:from-[#0B0B0B]/90" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 transition-all duration-500">
                  <h3 className="text-xl font-bold text-[#FFF9ED] transition-colors duration-300 group-hover:text-[#D4AF37]">
                    {collection.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#FFF9ED]/80">
                    {collection.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] transition-all duration-300 group-hover:gap-3">
                    Shop Now

                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-12 rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/10 to-[#C9A227]/10 p-8 sm:grid-cols-2 sm:gap-16 sm:p-10">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#D4AF37]">
              500+
            </p>

            <p className="mt-2 text-sm text-[#0B0B0B]/70">
              Premium Products
            </p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-[#D4AF37]">
              NB–10Y
            </p>

            <p className="mt-2 text-sm text-[#0B0B0B]/70">
              Age Groups Covered
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CollectionSection;

