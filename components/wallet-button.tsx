"use client";

import { useWallet } from "@/app/wallet-context";

function shorten(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function WalletButton() {
  const { address, connect, disconnect } = useWallet();

  if (address) {
    return (
      <button
        onClick={disconnect}
        className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-zinc-50"
      >
        <span className="font-mono">{shorten(address)}</span>
        <span className="text-[var(--color-muted)]"> · disconnect</span>
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      className="rounded-md bg-[var(--color-fg)] px-3 py-2 text-sm text-white hover:opacity-90"
    >
      connect wallet
    </button>
  );
}
