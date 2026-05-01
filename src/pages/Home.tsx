import Hero from '../components/home/Hero';
import TrendingDrops from '../components/home/TrendingDrops';
import ProcessSection from '../components/home/ProcessSection';
import StorySection from '../components/home/StorySection';
import InstagramGallery from '../components/home/InstagramGallery';
import Reviews from '../components/home/Reviews';

const Home = () => {
  return (
    <main>
      <Hero />
      <TrendingDrops />
      <ProcessSection />
      <StorySection />
      <InstagramGallery />
      <Reviews />
    </main>
  );
};

export default Home;
