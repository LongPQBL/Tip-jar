import { WalletButton } from "@/components/wallet-button";
import { Dashboard } from "@/components/dashboard";
import { HeroSection } from "@/components/hero-section";
import { StatsStrip } from "@/components/stats-strip";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-16">
        <header className="flex items-center justify-between gap-3 border-b border-border pb-5">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-3xl">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Tip Jar
          </h1>
          <WalletButton />
        </header>

        <HeroSection />
        <StatsStrip />

        <div className="my-8 border-t border-border" />

        <Dashboard />
      </div>
    </main>
  );
}
