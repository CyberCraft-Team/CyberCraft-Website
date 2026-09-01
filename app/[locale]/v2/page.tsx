import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroV2 } from "@/components/v2/hero-v2";
import {
  StatsStripV2,
  StartBandV2,
  NewsBentoV2,
  VotersV2,
} from "@/components/v2/sections-v2";

/**
 * Home page, v2 direction.
 *
 * Same brand and same content as the shipped home page. What changes is
 * the composition: the hero is an asymmetric split carrying the live
 * server board rather than a centred wordmark over a particle field, and
 * no two sections below it share a layout family.
 */
export default function HomeV2() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroV2 />
      <StatsStripV2 />
      <StartBandV2 />
      <NewsBentoV2 />
      <VotersV2 />
      <Footer />
    </main>
  );
}
