import AnnouncementBar from "../../sections/AnnouncementBar.jsx";
import Hero from "../../sections/Hero.jsx";
import CategorySection from "../../sections/CategorySection.jsx";
import NewArrivals from "../../sections/NewArrivals.jsx";
import BrandStory from "../../sections/BrandStory.jsx";
import BenefitsSection from "../../sections/BenefitsSection.jsx";
import StyleMarquee from "../../sections/StyleMarquee.jsx";

function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Hero />
      <CategorySection />
      <NewArrivals />
      <BrandStory />
      <BenefitsSection />
      <StyleMarquee />
    </>
  );
}

export default HomePage;
