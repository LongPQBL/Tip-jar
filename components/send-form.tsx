"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/app/wallet-context";
import { useSendTx } from "@/hooks/use-send-tx";
import {
  toError,
  UserRejectedError,
  InsufficientBalanceError,
} from "@/lib/errors";

export function SendForm() {
  const { address } = useWallet();
  const qc = useQueryClient();
  const send = useSendTx(address);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  if (!address) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await send.mutateAsync({ to, amount, memo: memo || undefined });
      qc.invalidateQueries({ queryKey: ["balance", address] });
      setAmount("");
      setMemo("");
    } catch {
      // error is exposed via send.error; UI handles it below
    }
  }

  const err = send.error ? toError(send.error) : null;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-lg border border-[var(--color-border)] p-5"
    >
      <div className="text-sm text-[var(--color-muted)]">send a tip</div>
      <input
        type="text"
        placeholder="destination address (G...)"
        value={to}
        onChange={(e) => setTo(e.target.value.trim())}
        required
        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
      />
      <input
        type="number"
        step="0.0000001"
        min="0"
        placeholder="amount (XLM)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
      />
      <input
        type="text"
        placeholder="memo (optional, max 28 chars)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        maxLength={28}
        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
      />
      <button
        type="submit"
        disabled={send.isPending}
        className="w-full rounded-md bg-[var(--color-fg)] px-3 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
      >
        {send.isPending ? "sending..." : "send tip"}
      </button>

      {send.isPending && (
        <div className="text-sm text-[var(--color-muted)]">
          awaiting wallet signature, then submitting to the network...
        </div>
      )}

      {send.isSuccess && send.data && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
          <div className="font-medium text-green-800">sent</div>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${send.data.hash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block break-all font-mono text-xs text-green-700 underline"
          >
            {send.data.hash}
          </a>
        </div>
      )}

      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {err instanceof UserRejectedError
            ? "you rejected the request in your wallet."
            : err instanceof InsufficientBalanceError
              ? "not enough xlm in your account to cover this transfer."
              : `failed: ${err.message}`}
        </div>
      )}
    </form>
  );
}
