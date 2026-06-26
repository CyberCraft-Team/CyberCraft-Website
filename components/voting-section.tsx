"use client";

import { ExternalLink, Gift, Trophy, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useVotingSites, useTopVoters } from "@/lib/api/hooks";
import type { VotingSite, TopVoter } from "@/lib/api/types";
import { useScrollRevealGroup } from "@/hooks/use-scroll-reveal";

export function VotingSection() {
  const { votingSites: apiVotingSites, isLoading: sitesLoading } =
    useVotingSites();
  const { topVoters: apiTopVoters, isLoading: votersLoading } = useTopVoters();
  const headerRevealRef = useScrollRevealGroup({ threshold: 0.2 });
  const contentRevealRef = useScrollRevealGroup({ threshold: 0.05 });

  const isLoading = sitesLoading || votersLoading;

  return (
    <section id="voting" className="py-20">
      <div className="container mx-auto px-4">
        <div
          className="text-center mb-12"
          ref={headerRevealRef as React.RefObject<HTMLDivElement>}
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            data-reveal="fade-up"
            data-delay="0"
          >
            <span className="text-[var(--text-primary)]">OVOZ </span>
            <span className="text-[var(--accent)] neon-green">BERING</span>
          </h2>
          <p
            className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto"
            data-reveal="fade-up"
            data-delay="150"
          >
            Serverimizga ovoz berib, kunlik bonuslar oling!
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
            <span className="ml-3 text-[var(--text-secondary)]">
              Ma'lumotlar yuklanmoqda...
            </span>
          </div>
        )}

        {!isLoading && (
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            ref={contentRevealRef as React.RefObject<HTMLDivElement>}
          >
            {/* Voting Sites */}
            <div
              className="lg:col-span-2"
              data-reveal="fade-right"
              data-delay="0"
            >
              <div className="glass rounded-2xl p-6 border border-[var(--accent)]/30">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[var(--accent)]" />
                  Ovoz berish saytlari
                </h3>

                {apiVotingSites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Gift className="w-12 h-12 text-[var(--text-secondary)] mb-4" />
                    <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      Ovoz berish saytlari topilmadi
                    </h4>
                    <p className="text-[var(--text-secondary)]">
                      Hozircha ovoz berish saytlari mavjud emas.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {apiVotingSites.map((site) => (
                        <a
                          key={site.id}
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-[var(--bg-dark)]/50 rounded-xl hover:bg-[var(--bg-dark)] transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--accent)]/20 rounded-lg flex items-center justify-center">
                              <Star className="w-5 h-5 text-[var(--accent)]" />
                            </div>
                            <span className="font-medium text-[var(--text-primary)]">
                              {site.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--accent)] text-sm font-bold">
                              +{site.bonus}
                            </span>
                            <ExternalLink className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
                          </div>
                        </a>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20">
                      <p className="text-sm text-[var(--text-secondary)]">
                        <span className="text-[var(--accent)] font-bold">Bonus:</span>{" "}
                        Har kuni barcha saytlarga ovoz berib,
                        <span className="text-[var(--accent)] font-bold">
                          {" "}
                          {apiVotingSites.reduce(
                            (sum, site) => sum + site.bonus,
                            0
                          )}{" "}
                          coin
                        </span>{" "}
                        va qo'shimcha sovrinlar yutib oling!
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div
              data-reveal="fade-left"
              data-delay="200"
            >
              <div className="glass rounded-2xl p-6 border border-[var(--primary)]/30">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[var(--primary)]" />
                  Oy yulduzlari
                </h3>

                {apiTopVoters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Trophy className="w-12 h-12 text-[var(--text-secondary)] mb-4" />
                    <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      Reyting topilmadi
                    </h4>
                    <p className="text-[var(--text-secondary)]">
                      Hozircha ovoz beruvchilar reytingi mavjud emas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiTopVoters.map((voter) => (
                      <div
                        key={voter.rank}
                        className={`flex items-center gap-4 p-3 rounded-xl ${voter.rank === 1
                          ? "bg-[var(--primary)]/20 border border-[var(--primary)]/30"
                          : "bg-[var(--bg-dark)]/50"
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${voter.rank === 1
                            ? "bg-[var(--primary)] text-[var(--bg-dark)]"
                            : voter.rank === 2
                              ? "bg-gray-400 text-[var(--bg-dark)]"
                              : "bg-amber-700 text-[var(--bg-dark)]"
                            }`}
                        >
                          {voter.rank}
                        </div>
                        <Image
                          src={
                            voter.avatar_url ||
                            "/placeholder.svg?height=40&width=40&query=minecraft player avatar"
                          }
                          alt={voter.username}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-[var(--text-primary)]">
                            {voter.username}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {voter.votes} ovoz
                          </p>
                        </div>
                        {voter.rank === 1 && (
                          <Trophy className="w-5 h-5 text-[var(--primary)]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button className="w-full mt-6 cyber-btn">
                  To'liq ro'yxat
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
