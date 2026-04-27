import { WalletButton } from "@/components/wallet-button";
import { BalanceCard } from "@/components/balance-card";
import { SendForm } from "@/components/send-form";
import { EventFeed } from "@/components/event-feed";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-20">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            tip jar
          </h1>
          <WalletButton />
        </header>
        <p className="mt-3 text-[var(--color-muted)]">
          send xlm tips on stellar testnet.
        </p>
        <div className="mt-8 space-y-4">
          <BalanceCard />
          <SendForm />
          <EventFeed />
        </div>
      </div>
    </main>
  );
}
