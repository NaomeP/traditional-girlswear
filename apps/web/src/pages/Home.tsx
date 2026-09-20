import Hero from "../components/home/Hero";
import CollectionSection from "../components/home/CollectionSection";
import AgeSection from "../components/home/AgeSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import BrandStory from "../components/home/BrandStory";
import CTASection from "../components/home/CTASection";
import HomeHighlights from "../components/home/HomeHighlights";
import { useEffect, useState } from "react";
import { DEFAULT_HOME_CONTENT, getHomePageContent } from "../services/homePageService";

function Home() {
  const [content, setContent] = useState(DEFAULT_HOME_CONTENT);
  useEffect(() => { void getHomePageContent().then(setContent).catch((error) => console.error(error)); }, []);
  return (
    <>
      <Hero content={content.hero} />
      <HomeHighlights items={content.highlights} />
      <CollectionSection content={content.collections} />
      <AgeSection content={content.ages} />
      <FeaturedProducts />
      <BrandStory content={content.story} />
      <CTASection content={content.cta} />
    </>
  );
}

export default Home;
