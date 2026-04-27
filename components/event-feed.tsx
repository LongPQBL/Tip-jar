"use client";

import { useContractEvents } from "@/hooks/use-contract-events";
import type { TipEvent } from "@/lib/events";

function shortAddr(a: string) {
  return `${a.slice(0, 4)}...${a.slice(-4)}`;
}

function fmtAmount(stroops: bigint) {
  const xlm = Number(stroops) / 1e7;
  return xlm.toFixed(4).replace(/\.?0+$/, "");
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const s = Math.floor(d / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function EventFeed() {
  const { data, isLoading, isError } = useContractEvents();

  return (
    <div className="rounded-lg border border-[var(--color-border)] p-5">
      <div className="text-sm text-[var(--color-muted)]">recent tips</div>
      {isLoading ? (
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-3 text-sm text-red-600">failed to load events</div>
      ) : !data || data.length === 0 ? (
        <div className="mt-3 text-sm text-[var(--color-muted)]">
          no tips yet. send one to see it here.
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {data.map((e) => (
            <TipRow key={e.id} e={e} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TipRow({ e }: { e: TipEvent }) {
  return (
    <li className="border-l-2 border-zinc-200 pl-3 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="font-mono text-xs">{shortAddr(e.from)}</span>
          <span className="text-[var(--color-muted)]"> tipped </span>
          <span className="font-mono text-xs">{shortAddr(e.to)}</span>
        </div>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${e.txHash}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[var(--color-muted)] hover:underline"
        >
          {timeAgo(e.ledgerClosedAt)}
        </a>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="font-medium">{fmtAmount(e.amount)} XLM</span>
        {e.memo && (
          <span className="truncate text-[var(--color-muted)]">
            &ldquo;{e.memo}&rdquo;
          </span>
        )}
      </div>
    </li>
  );
}
