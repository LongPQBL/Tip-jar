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

const EXPLORER = "https://stellar.expert/explorer/testnet/tx";

const inputCls =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

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
      qc.invalidateQueries({ queryKey: ["receipts"] });
      setAmount("");
      setMemo("");
    } catch {
      // surfaced via send.error below
    }
  }

  const err = send.error ? toError(send.error) : null;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-lg border border-border bg-surface p-5"
    >
      <div className="text-xs uppercase tracking-wider text-subtle">
        Send Tip
      </div>
      <input
        type="text"
        placeholder="Destination (G...)"
        value={to}
        onChange={(e) => setTo(e.target.value.trim())}
        required
        className={`${inputCls} font-mono`}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          step="0.0000001"
          min="0.0000001"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className={`${inputCls} font-mono`}
        />
        <input
          type="text"
          placeholder="Memo (optional)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={28}
          className={inputCls}
        />
      </div>
      <button
        type="submit"
        disabled={send.isPending}
        className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-colors hover:bg-cyan-300 disabled:opacity-50"
      >
        {send.isPending ? "Sending..." : "Send Tip →"}
      </button>

      {send.isPending && (
        <div className="text-xs text-subtle">
          Awaiting wallet signatures (payment + on-chain log)...
        </div>
      )}

      {send.isSuccess && send.data && (
        <div className="space-y-1.5 rounded-md border border-success/30 bg-success/5 p-3 text-xs">
          <div className="font-medium text-success">Sent and logged</div>
          <a
            href={`${EXPLORER}/${send.data.paymentHash}`}
            target="_blank"
            rel="noreferrer"
            className="block break-all font-mono text-muted hover:text-success"
          >
            Payment: {send.data.paymentHash.slice(0, 16)}...
          </a>
          <a
            href={`${EXPLORER}/${send.data.contractHash}`}
            target="_blank"
            rel="noreferrer"
            className="block break-all font-mono text-muted hover:text-success"
          >
            On-chain: {send.data.contractHash.slice(0, 16)}...
          </a>
        </div>
      )}

      {err && (
        <div className="rounded-md border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
          {err instanceof UserRejectedError
            ? "You rejected the request in your wallet."
            : err instanceof InsufficientBalanceError
              ? "Not enough XLM in your account to cover this transfer."
              : `Failed: ${err.message}`}
        </div>
      )}
    </form>
  );
}
