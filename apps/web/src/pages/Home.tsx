import Hero from "../components/home/Hero";
import CollectionSection from "../components/home/CollectionSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import BrandStory from "../components/home/BrandStory";
import CTASection from "../components/home/CTASection";

function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CollectionSection />
      <BrandStory />
      <CTASection />
      <div
        data-ad-slot="home-bottom"
        className="min-h-12 bg-[#fffaf1] sm:min-h-32"
      />
    </>
  );
}

export default Home;
