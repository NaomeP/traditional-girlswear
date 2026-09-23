
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { optimizedImageUrl } from "../../utils/optimizedImageUrl";

type Collection = { id: string; name: string; description: string | null; imageUrl: string | null };

function CollectionSection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  useEffect(() => { void fetch(`${API_BASE_URL}/categories`).then((response) => response.json()).then((result) => { if (result.success) setCollections(result.data); }).catch(console.error); }, []);
  return (
    <section className="relative overflow-hidden bg-[#FFF9ED] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Decorative Background Elements */}
      <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-[#D4AF37]/5 blur-3xl" />

      <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#C9A227]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
          <div className="max-w-lg">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#C9A227] animate-in fade-in slide-in-from-left-4 duration-500">
              Our Collections
            </p>

            <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#24160f] sm:text-4xl">
              Featured Collections
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#0B0B0B]/60 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              Curated collections of traditional South Indian wear for every occasion and age group.
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
        {collections.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-xl bg-[#f0e8d8] sm:aspect-[4/5]"
              />
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              to={`/shop?category=${encodeURIComponent(collection.name)}`}
              className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#F7F3EA] to-[#F0E8D8] shadow-md transition-all duration-500 group-hover:shadow-xl sm:aspect-[4/5] sm:rounded-2xl">
                {/* Image */}
                <img
                  src={optimizedImageUrl(collection.imageUrl || "/images/products/traditional-cotton-frock.jpg", 700)}
                  loading="lazy"
                  decoding="async"
                  alt={collection.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/95 via-[#0B0B0B]/40 to-transparent transition-all duration-500 group-hover:from-[#0B0B0B]/90" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-3 transition-all duration-500 sm:p-5">
                  <h3 className="text-base font-bold text-[#FFF9ED] transition-colors duration-300 group-hover:text-[#D4AF37] sm:text-xl">
                    {collection.name}
                  </h3>

                  <p className="mt-1 text-[11px] leading-4 text-[#FFF9ED]/80 sm:text-sm sm:leading-5">
                    {collection.description || "Beautiful traditional styles for little girls."}
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#D4AF37] transition-all duration-300 group-hover:gap-2 sm:mt-4 sm:gap-2 sm:text-xs sm:tracking-[0.18em] sm:group-hover:gap-3">
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
        )}

        {/* Stats Section */}
      </div>
    </section>
  );
}

export default CollectionSection;

