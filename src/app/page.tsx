import { Faq } from "@/components/features/landing-pages/faq";
import { Feature } from "@/components/features/landing-pages/feature";
import { Footer } from "@/components/features/landing-pages/footer";
import { Header } from "@/components/features/landing-pages/header";
import { Hero } from "@/components/features/landing-pages/hero";
import { Pricing } from "@/components/features/landing-pages/pricing";
import { Screenshot } from "@/components/features/landing-pages/screenshot";

export default function HomePage() {
  return (
    <main className="relative w-full">
      <Header />
      <Hero />
      <Screenshot />
      <Feature />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}
