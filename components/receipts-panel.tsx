"use client";

import { useWallet } from "@/app/wallet-context";
import { useReceipts } from "@/hooks/use-receipts";

const RECEIPT_ID = process.env.NEXT_PUBLIC_RECEIPT_CONTRACT_ID;

export function ReceiptsPanel() {
  const { address } = useWallet();
  const { data, isLoading, isError } = useReceipts(address);

  if (!address) return null;

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="text-xs uppercase tracking-wider text-subtle">
        your receipts
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
          {isLoading ? (
            <span className="inline-block h-7 w-16 animate-pulse rounded bg-elevated sm:h-8" />
          ) : isError ? (
            <span className="text-base font-normal text-danger">err</span>
          ) : (
            String(data ?? 0n)
          )}
        </div>
        <div className="text-sm text-muted">tips you&apos;ve sent</div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-subtle">
        <span>soulbound · non-transferable proof</span>
        {RECEIPT_ID && (
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${RECEIPT_ID}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono hover:text-accent"
          >
            {RECEIPT_ID.slice(0, 4)}...{RECEIPT_ID.slice(-4)}
          </a>
        )}
      </div>
    </div>
  );
}
