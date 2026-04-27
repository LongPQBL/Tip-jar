import { WalletButton } from "@/components/wallet-button";
import { BalanceCard } from "@/components/balance-card";
import { SendForm } from "@/components/send-form";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <header className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight">tip jar</h1>
          <WalletButton />
        </header>
        <p className="mt-3 text-[var(--color-muted)]">
          send xlm tips on stellar testnet.
        </p>
        <div className="mt-8 space-y-4">
          <BalanceCard />
          <SendForm />
        </div>
      </div>
    </main>
  );
}
