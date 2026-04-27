"use client";

import { useQuery } from "@tanstack/react-query";
import { readContract } from "@/lib/soroban";
import { getRecentTipEvents } from "@/lib/events";

export function useGlobalStats() {
  const tipJarId = process.env.NEXT_PUBLIC_TIP_JAR_CONTRACT_ID;
  const receiptId = process.env.NEXT_PUBLIC_RECEIPT_CONTRACT_ID;

  return useQuery({
    queryKey: ["global-stats", tipJarId, receiptId],
    queryFn: async () => {
      if (!tipJarId || !receiptId)
        throw new Error("contract ids not configured");

      const [events, totalSupply] = await Promise.all([
        getRecentTipEvents(tipJarId).catch(() => []),
        readContract<bigint>({
          contractId: receiptId,
          method: "total_supply",
          args: [],
        }).catch(() => 0n),
      ]);

      const recentXlm = events.reduce((acc, e) => acc + e.amount, 0n);
      const recipients = new Set(events.map((e) => e.to)).size;

      return {
        // 1:1 with tips ever (since each tip mints exactly one receipt)
        tipsLogged: totalSupply,
        recentXlm,
        recipients,
      };
    },
    enabled: !!tipJarId && !!receiptId,
    refetchInterval: 30_000,
  });
}
