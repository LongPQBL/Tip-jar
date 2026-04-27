export function HeroSection() {
  return (
    <section className="mt-6">
      <p className="text-base leading-relaxed text-muted sm:text-lg">
        send tips on stellar testnet.{" "}
        <span className="text-fg">every tip is logged on-chain</span> and the
        tipper gets a soulbound receipt token back as proof.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <Step n={1} label="connect" desc="a stellar wallet" />
        <Step n={2} label="send" desc="any address with a memo" />
        <Step n={3} label="collect" desc="a receipt per tip" />
      </div>
    </section>
  );
}

function Step({ n, label, desc }: { n: number; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent font-mono text-xs text-accent">
        {n}
      </span>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-subtle">{desc}</div>
      </div>
    </div>
  );
}
