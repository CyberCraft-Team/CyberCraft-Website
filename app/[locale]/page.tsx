import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServersSection } from "@/components/servers-section"
import { NewsSection } from "@/components/news-section"
import { VotingSection } from "@/components/voting-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ServersSection />
      <NewsSection />
      <VotingSection />
      <Footer />
    </main>
  )
}
