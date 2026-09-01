"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Download, UserPlus, Swords, Trophy, ArrowRight } from "lucide-react";

import { useNews, useStats, useTopVoters } from "@/lib/api/hooks";
import { useScrollRevealGroup } from "@/hooks/use-scroll-reveal";

/* ── Stats strip ─────────────────────────────────────────────────────
   Hairline row, not cards. v1 gave three identical boxes equal weight,
   which flattened the one number a visitor actually reads. Here the
   figures sit on a single rule and the live count leads. */

export function StatsStripV2() {
  const { stats, isLoading, isError } = useStats();
  const revealRef = useScrollRevealGroup();

  const figures = [
    { label: "Hozir onlayn", value: stats?.online_players, lead: true },
    { label: "Rekord onlayn", value: stats?.max_online },
    { label: "Faol server", value: stats?.active_servers },
    { label: "Ro'yxatdan o'tgan", value: stats?.total_registered },
  ];

  return (
    <section className="border-y border-[var(--border-color)] bg-[var(--surface-sunken)]">
      <div
        ref={revealRef as React.RefObject<HTMLDivElement>}
        className="container mx-auto grid grid-cols-2 gap-px bg-[var(--border-color)] px-0 md:grid-cols-4"
      >
        {figures.map((f, i) => (
          <div
            key={f.label}
            className="bg-[var(--surface-sunken)] px-6 py-8"
            data-reveal="fade-up"
            data-delay={i * 70}
          >
            <p
              className={`font-mono text-3xl tabular-nums md:text-4xl ${
                f.lead ? "text-[var(--primary)]" : "text-[var(--text-primary)]"
              }`}
            >
              {isLoading ? "..." : isError ? "--" : (f.value ?? "--").toLocaleString()}
            </p>
            <p className="mt-2 text-[12px] text-[var(--text-secondary)]">{f.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Getting started ─────────────────────────────────────────────────
   Three moves, named by the verb rather than numbered. Full-width band,
   so it does not rhyme with the split hero above it. */

const STEPS = [
  {
    icon: Download,
    title: "Launcherni yuklab ol",
    body: "Windows uchun bitta fayl. O'rnatish talab qilinmaydi, ochasan va ishlaydi.",
  },
  {
    icon: UserPlus,
    title: "Akkauntingga kir",
    body: "Google yoki Telegram orqali. Alohida parol o'ylab topish shart emas.",
  },
  {
    icon: Swords,
    title: "Serverni tanla",
    body: "Modlar, resurs paketlar va Java avtomatik yuklanadi. Qolgani o'yin.",
  },
];

export function StartBandV2() {
  const revealRef = useScrollRevealGroup();

  return (
    <section className="py-24">
      <div
        ref={revealRef as React.RefObject<HTMLDivElement>}
        className="container mx-auto px-4"
      >
        <h2
          className="font-pixel text-[18px] leading-[1.6] text-[var(--text-primary)] md:text-[22px]"
          data-reveal="fade-up"
        >
          QANDAY BOSHLANADI
        </h2>

        {/* A vertical flow, not three equal columns. These are ordered
            moves, and a row per move keeps the order legible; a card row
            would also have repeated the figure strip directly above. */}
        <ol className="mt-12 max-w-[760px]">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="group flex gap-6 border-t border-[var(--border-color)] py-8 sm:gap-9"
              data-reveal="fade-up"
              data-delay={i * 90}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--primary)]/12 text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-[#06210a]">
                <step.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[18px] font-semibold text-[var(--text-primary)] sm:text-[20px]">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[54ch] text-[14px] leading-6 text-[var(--text-secondary)]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── News ────────────────────────────────────────────────────────────
   One lead story plus two secondaries. An equal three-card row would
   repeat the step band directly above and give every item the same
   weight, which is not how a news page reads. */

function NewsCard({
  item,
  lead = false,
}: {
  item: any;
  lead?: boolean;
}) {
  return (
    <Link
      href={`/news/${item.id}`}
      className={`cyber-card group flex flex-col overflow-hidden ${
        lead ? "md:row-span-2" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-[var(--surface-sunken)] ${
          lead ? "aspect-[16/10]" : "aspect-[16/9]"
        }`}
      >
        <Image
          src={item.image_url || "/voxel-vista.png"}
          alt=""
          fill
          sizes={lead ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3
          className={`font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--primary)] ${
            lead ? "text-xl" : "text-[15px]"
          }`}
        >
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-6 text-[var(--text-secondary)]">
          {item.excerpt}
        </p>
        <span className="mt-4 font-mono text-[11px] text-[var(--text-secondary)]">
          {item.date ? new Date(item.date).toLocaleDateString("uz-UZ") : ""}
        </span>
      </div>
    </Link>
  );
}

export function NewsBentoV2() {
  const { news, isLoading, isError } = useNews();
  const revealRef = useScrollRevealGroup();

  const [lead, ...rest] = news ?? [];
  const secondaries = rest.slice(0, 2);

  return (
    <section className="border-t border-[var(--border-color)] py-24">
      <div
        ref={revealRef as React.RefObject<HTMLDivElement>}
        className="container mx-auto px-4"
      >
        <div className="flex items-baseline justify-between gap-6">
          <h2
            className="font-pixel text-[18px] leading-[1.6] text-[var(--text-primary)] md:text-[22px]"
            data-reveal="fade-up"
          >
            YANGILIKLAR
          </h2>
          <Link
            href="/news"
            className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)]"
          >
            Barchasi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading && (
          <div className="mt-12 grid animate-pulse gap-4 md:grid-cols-2">
            <div className="aspect-[16/10] bg-[var(--bg-card)]" />
            <div className="grid gap-4">
              <div className="aspect-[16/9] bg-[var(--bg-card)]" />
              <div className="aspect-[16/9] bg-[var(--bg-card)]" />
            </div>
          </div>
        )}

        {isError && !isLoading && (
          <div className="cyber-card mt-12 px-6 py-14 text-center">
            <p className="text-[14px] text-[var(--text-secondary)]">
              Yangiliklarni yuklab bo&apos;lmadi. Birozdan keyin qayta urinib
              ko&apos;ring.
            </p>
          </div>
        )}

        {!isLoading && !isError && news.length === 0 && (
          <div className="cyber-card mt-12 px-6 py-14 text-center">
            <p className="text-[14px] text-[var(--text-secondary)]">
              Hali yangilik chiqmagan. Birinchisi server ochilishi bilan shu
              yerda paydo bo&apos;ladi.
            </p>
          </div>
        )}

        {/* Cell count follows the data: one item renders one cell, three
            render the full lead-plus-two composition. No blank tiles. */}
        {!isLoading && !isError && news.length > 0 && (
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <div data-reveal="fade-up">
              <NewsCard item={lead} lead />
            </div>
            {secondaries.length > 0 && (
              <div className="grid gap-4 content-start">
                {secondaries.map((item: any, i: number) => (
                  <div key={item.id} data-reveal="fade-up" data-delay={(i + 1) * 90}>
                    <NewsCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Top voters ──────────────────────────────────────────────────────
   A ranked list, which is what a leaderboard is. Card grids hide the
   ordering that gives the section its point. */

export function VotersV2() {
  const { topVoters, isLoading, isError } = useTopVoters();
  const revealRef = useScrollRevealGroup();

  return (
    <section className="border-t border-[var(--border-color)] py-24">
      <div
        ref={revealRef as React.RefObject<HTMLDivElement>}
        className="container mx-auto px-4"
      >
        <h2
          className="font-pixel text-[18px] leading-[1.6] text-[var(--text-primary)] md:text-[22px]"
          data-reveal="fade-up"
        >
          OVOZ BERGANLAR
        </h2>
        <p className="mt-4 max-w-[52ch] text-[14px] leading-6 text-[var(--text-secondary)]">
          Serverga ovoz bergan o&apos;yinchilar CC oladi va reytingda
          ko&apos;tariladi.
        </p>

        <div className="mt-10 max-w-[620px]">
          {isLoading && (
            <div className="animate-pulse space-y-px">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-[var(--bg-card)]" />
              ))}
            </div>
          )}

          {isError && !isLoading && (
            <p className="text-[14px] text-[var(--text-secondary)]">
              Reytingni yuklab bo&apos;lmadi. Birozdan keyin qayta urinib
              ko&apos;ring.
            </p>
          )}

          {!isLoading && !isError && topVoters.length === 0 && (
            <div className="cyber-card px-6 py-12 text-center">
              <Trophy className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
              <p className="mt-4 text-[14px] text-[var(--text-secondary)]">
                Hali hech kim ovoz bermagan. Birinchi bo&apos;lish uchun
                yaxshi payt.
              </p>
              <Link
                href="/voting"
                className="cyber-btn mt-6 inline-flex items-center gap-2 px-6 py-3 text-[14px]"
              >
                Ovoz berish
              </Link>
            </div>
          )}

          {!isLoading &&
            !isError &&
            topVoters.map((voter: any, i: number) => (
              <div
                key={voter.username}
                className="flex items-center gap-4 border-b border-[var(--border-color)] py-4 transition-colors hover:bg-[var(--bg-card)]"
                data-reveal="fade-up"
                data-delay={i * 60}
              >
                <span
                  className={`font-mono w-8 shrink-0 text-center text-[15px] tabular-nums ${
                    i === 0 ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {voter.rank}
                </span>
                {voter.avatar_url ? (
                  <Image
                    src={voter.avatar_url}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--primary)] font-pixel text-[9px] text-[#06210a]">
                    {voter.username.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-[15px] text-[var(--text-primary)]">
                  {voter.username}
                </span>
                <span className="font-mono shrink-0 text-[14px] tabular-nums text-[var(--text-secondary)]">
                  {voter.votes}
                </span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
