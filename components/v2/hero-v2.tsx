"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, ArrowDown } from "lucide-react";

import { useServers, useStats } from "@/lib/api/hooks";
import { useScrollRevealGroup } from "@/hooks/use-scroll-reveal";
import { LauncherDownloadModal } from "@/components/launcher-download-modal";

/**
 * v2 hero: asymmetric split, live board on the right.
 *
 * v1 centred the wordmark over a particle field and put three identical
 * stat cards under it. That composition says nothing a visitor came to
 * find out. Here the right column carries the actual server board, live
 * from the API, so the first thing on screen is whether there is
 * somewhere to play right now.
 */

function isUp(status: string) {
  return status === "online" || status === "running";
}

function statusTone(status: string) {
  if (isUp(status)) return "bg-[var(--primary)]";
  if (status === "starting") return "bg-[var(--warning)]";
  return "bg-[var(--error)]";
}

function statusWord(status: string) {
  if (isUp(status)) return "ONLAYN";
  if (status === "starting") return "KO'TARILMOQDA";
  return "OFLAYN";
}

function BoardRow({ server }: { server: any }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-t border-[var(--border-color)] transition-colors hover:bg-[var(--surface-raised)]">
      <span
        className={`w-2 h-2 shrink-0 ${statusTone(server.status)} ${
          isUp(server.status) ? "animate-pulse-glow" : ""
        }`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-[var(--text-primary)]">
          {server.name}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
          {server.server_type} / {server.minecraft_version}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-[15px] tabular-nums text-[var(--text-primary)]">
          {server.current_players}
          <span className="text-[var(--text-secondary)]">/{server.max_players}</span>
        </p>
        <p className="font-pixel mt-1 text-[7px] leading-none text-[var(--text-secondary)]">
          {statusWord(server.status)}
        </p>
      </div>
    </div>
  );
}

/** Skeleton mirrors BoardRow's shape rather than spinning in the middle. */
function BoardSkeleton() {
  return (
    <div className="animate-pulse">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-t border-[var(--border-color)]"
        >
          <span className="w-2 h-2 shrink-0 bg-[var(--border-color)]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-32 bg-[var(--border-color)]" />
            <div className="h-2.5 w-20 bg-[var(--border-color)]/60" />
          </div>
          <div className="h-3.5 w-12 bg-[var(--border-color)]" />
        </div>
      ))}
    </div>
  );
}

export function HeroV2() {
  const { servers, isLoading, isError } = useServers();
  const { stats } = useStats();
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const revealRef = useScrollRevealGroup({ threshold: 0.05, rootMargin: "0px" });

  const online = servers?.filter((s: any) => isUp(s.status)).length ?? 0;

  // Not a full 100dvh: the hero carries two short columns, and stretching it
  // to the whole viewport left the content stranded below the fold's midpoint
  // with an empty top half above it.
  return (
    <section className="relative min-h-[82dvh] flex items-center overflow-hidden">
      {/* The project's own voxel landscape, held far back so the type and
          the board stay the subject. */}
      <Image
        src="/voxel-vista.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.55]"
      />
      {/* Scrim is directional: heavy under the copy column on the left,
          light on the right so the landscape stays visible behind the
          board instead of being flattened to black everywhere. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-dark)] via-[var(--bg-dark)]/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-dark)] via-transparent to-[var(--bg-dark)]/55" />
      <div className="pixel-grid absolute inset-0 opacity-40" />

      <div
        ref={revealRef as React.RefObject<HTMLDivElement>}
        className="container mx-auto px-4 relative z-10 pt-20 pb-12"
      >
        {/* Asymmetric on purpose: the copy column is wider than the board,
            so the two halves do not read as a symmetrical pair. */}
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:items-center">
          <div>
            <h1
              className="font-pixel text-[26px] leading-[1.5] sm:text-[34px] sm:leading-[1.45] text-[var(--text-primary)]"
              data-reveal="fade-right"
              data-delay="0"
            >
              BIR KLIK.
              <br />
              <span className="text-[var(--primary)]">O&apos;YIN TAYYOR.</span>
            </h1>

            <p
              className="mt-7 max-w-[46ch] text-[15px] leading-7 text-[var(--text-secondary)]"
              data-reveal="fade-right"
              data-delay="120"
            >
              Launcher modlarni, resurs paketlarni va Java&apos;ni o&apos;zi sozlaydi.
              Sen faqat kirasan va o&apos;ynaysan.
            </p>

            <div
              className="mt-9 flex flex-col sm:flex-row gap-3"
              data-reveal="fade-right"
              data-delay="240"
            >
              <button
                onClick={() => setIsDownloadOpen(true)}
                className="cyber-btn inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[15px] cursor-pointer"
              >
                <Download className="w-[18px] h-[18px]" />
                Launcher yuklash
              </button>
              <a
                href="#serverlar"
                className="inline-flex items-center justify-center gap-2.5 border border-[var(--border-color)] px-7 py-4 text-[15px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                Serverlarni ko&apos;rish
                <ArrowDown className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>

          {/* Live board */}
          <div
            className="cyber-card overflow-hidden"
            data-reveal="fade-left"
            data-delay="180"
          >
            <div className="flex items-baseline justify-between gap-4 px-5 py-4">
              <span className="font-pixel text-[9px] leading-none text-[var(--text-secondary)]">
                SERVERLAR
              </span>
              <span className="font-mono text-[12px] tabular-nums text-[var(--primary)]">
                {online} / {servers?.length ?? 0} onlayn
              </span>
            </div>

            {isLoading && <BoardSkeleton />}

            {isError && !isLoading && (
              <div className="border-t border-[var(--border-color)] px-5 py-10 text-center">
                <p className="text-[13px] text-[var(--text-secondary)]">
                  Serverlar ro&apos;yxatini yuklab bo&apos;lmadi. Birozdan keyin
                  qayta urinib ko&apos;ring.
                </p>
              </div>
            )}

            {!isLoading && !isError && servers?.length === 0 && (
              <div className="border-t border-[var(--border-color)] px-5 py-10 text-center">
                <p className="text-[13px] text-[var(--text-secondary)]">
                  Hozircha ochiq server yo&apos;q. Birinchi bo&apos;lib
                  xabar olish uchun launcherni o&apos;rnatib qo&apos;ying.
                </p>
              </div>
            )}

            {!isLoading &&
              !isError &&
              servers?.map((server: any) => (
                <BoardRow key={server.id} server={server} />
              ))}

            {/* Registered-player count belongs to the board, not to a
                separate card row: it is the same fact set. */}
            <div className="flex items-center justify-between gap-4 border-t border-[var(--border-color)] bg-[var(--surface-sunken)] px-5 py-3.5">
              <span className="text-[11px] text-[var(--text-secondary)]">
                Ro&apos;yxatdan o&apos;tgan o&apos;yinchilar
              </span>
              <span className="font-mono text-[13px] tabular-nums text-[var(--text-primary)]">
                {stats?.total_registered ?? "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <LauncherDownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />
    </section>
  );
}
