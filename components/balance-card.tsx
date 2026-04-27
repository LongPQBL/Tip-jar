"use client";

import { useWallet } from "@/app/wallet-context";
import { useBalance } from "@/hooks/use-balance";

function formatXlm(raw: string) {
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return raw;
  return n.toFixed(4).replace(/\.?0+$/, "");
}

export function BalanceCard() {
  const { address } = useWallet();
  const { data, isLoading, isError } = useBalance(address);

  if (!address) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] p-5">
      <div className="text-sm text-[var(--color-muted)]">balance</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        {isLoading ? (
          <span className="inline-block h-7 w-32 animate-pulse rounded bg-zinc-100 sm:h-8 sm:w-40" />
        ) : isError ? (
          <span className="text-base font-normal text-red-600">
            failed to load
          </span>
        ) : (
          <>
            {formatXlm(data ?? "0")}{" "}
            <span className="text-lg text-[var(--color-muted)] sm:text-xl">
              XLM
            </span>
          </>
        )}
      </div>
    </div>
  );
}
