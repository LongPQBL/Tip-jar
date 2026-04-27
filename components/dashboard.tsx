"use client";

import { useWallet } from "@/app/wallet-context";
import { BalanceCard } from "./balance-card";
import { ReceiptsPanel } from "./receipts-panel";
import { SendForm } from "./send-form";
import { EventFeed } from "./event-feed";

export function Dashboard() {
  const { address, connect } = useWallet();

  return (
    <div className="space-y-4">
      {address ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <BalanceCard />
            <ReceiptsPanel />
          </div>
          <SendForm />
        </>
      ) : (
        <ConnectCta onConnect={connect} />
      )}
      <EventFeed />
    </div>
  );
}

function ConnectCta({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 text-center">
      <div className="text-xs uppercase tracking-wider text-subtle">Connect</div>
      <h2 className="mt-2 text-lg font-semibold">
        Connect a Wallet to Start Tipping
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        You&apos;ll see your testnet balance, your collected receipts, and the
        form to send a tip. A Freighter wallet on testnet works in seconds.
      </p>
      <button
        onClick={onConnect}
        className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-cyan-300"
      >
        Connect Wallet
      </button>
    </div>
  );
}
