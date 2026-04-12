import HeroSection from "@/components/HeroSection";
import InteractiveGuide from "@/components/InteractiveGuide";
import { getPatiosSortedByScore } from "@/data/patios";

export default function Home() {
  const patios = getPatiosSortedByScore();

  return (
    <main>
      <HeroSection />
      <InteractiveGuide patios={patios} />
    </main>
  );
}
