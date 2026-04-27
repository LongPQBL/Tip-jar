import { WalletButton } from "@/components/wallet-button";
import { BalanceCard } from "@/components/balance-card";
import { ReceiptsPanel } from "@/components/receipts-panel";
import { SendForm } from "@/components/send-form";
import { EventFeed } from "@/components/event-feed";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-16">
        <header className="flex items-center justify-between gap-3 border-b border-border pb-5">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-3xl">
            <span className="h-2 w-2 rounded-full bg-accent" />
            tip jar
          </h1>
          <WalletButton />
        </header>
        <p className="mt-4 text-sm text-muted">
          send xlm tips on stellar testnet. each tip mints a soulbound receipt.
        </p>
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <BalanceCard />
            <ReceiptsPanel />
          </div>
          <SendForm />
          <EventFeed />
        </div>
      </div>
    </main>
  );
}
