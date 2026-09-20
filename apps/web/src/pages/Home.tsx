import Hero from "../components/home/Hero";
import CollectionSection from "../components/home/CollectionSection";
import AgeSection from "../components/home/AgeSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import BrandStory from "../components/home/BrandStory";
import CTASection from "../components/home/CTASection";
import HomeHighlights from "../components/home/HomeHighlights";

function Home() {
  return (
    <>
      <Hero />
      <HomeHighlights />
      <CollectionSection />
      <AgeSection />
      <FeaturedProducts />
      <BrandStory />
      <CTASection />
    </>
  );
}

export default Home;
