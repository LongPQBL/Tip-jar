"use client";

import { useGlobalStats } from "@/hooks/use-global-stats";

const TIP_JAR_ID = process.env.NEXT_PUBLIC_TIP_JAR_CONTRACT_ID;

function fmt(n?: number | bigint): string {
  if (n === undefined) return "—";
  return Number(n).toLocaleString("en-US");
}

function fmtXlm(stroops?: bigint): string {
  if (stroops === undefined) return "—";
  return (Number(stroops) / 1e7).toFixed(2);
}

export function StatsStrip() {
  const { data, isLoading } = useGlobalStats();

  return (
    <section className="mt-6">
      <div className="text-xs uppercase tracking-wider text-subtle">global</div>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox
          label="tips logged"
          value={fmt(data?.tipsLogged)}
          loading={isLoading}
        />
        <StatBox
          label="recent xlm"
          value={fmtXlm(data?.recentXlm)}
          loading={isLoading}
        />
        <StatBox
          label="recipients"
          value={fmt(data?.recipients)}
          loading={isLoading}
        />
        <StatBox
          label="tip jar"
          value={
            TIP_JAR_ID ? `${TIP_JAR_ID.slice(0, 4)}...${TIP_JAR_ID.slice(-4)}` : "—"
          }
          href={
            TIP_JAR_ID
              ? `https://stellar.expert/explorer/testnet/contract/${TIP_JAR_ID}`
              : undefined
          }
          loading={false}
          mono
        />
      </div>
    </section>
  );
}

function StatBox({
  label,
  value,
  loading,
  href,
  mono,
}: {
  label: string;
  value: string;
  loading: boolean;
  href?: string;
  mono?: boolean;
}) {
  const content = (
    <div className="rounded-md border border-border bg-surface p-3 transition-colors">
      <div className="text-[10px] uppercase tracking-wider text-subtle">
        {label}
      </div>
      <div
        className={`mt-1 font-mono font-semibold ${
          mono ? "text-sm" : "text-base sm:text-lg"
        }`}
      >
        {loading ? (
          <span className="inline-block h-5 w-12 animate-pulse rounded bg-elevated" />
        ) : (
          value
        )}
      </div>
    </div>
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block rounded-md transition-colors hover:[&>div]:border-accent"
      >
        {content}
      </a>
    );
  }
  return content;
}
