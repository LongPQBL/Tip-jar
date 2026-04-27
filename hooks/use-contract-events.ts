"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentTipEvents } from "@/lib/events";

export function useContractEvents() {
  const contractId = process.env.NEXT_PUBLIC_TIP_JAR_CONTRACT_ID;
  return useQuery({
    queryKey: ["events", "tips", contractId],
    queryFn: () => {
      if (!contractId) throw new Error("contract id not configured");
      return getRecentTipEvents(contractId);
    },
    enabled: !!contractId,
    refetchInterval: 6_000,
  });
}
