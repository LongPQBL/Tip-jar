"use client";

import { useQuery } from "@tanstack/react-query";
import { readContract, addrArg } from "@/lib/soroban";

export function useReceipts(address: string | null) {
  const contractId = process.env.NEXT_PUBLIC_RECEIPT_CONTRACT_ID;
  return useQuery({
    queryKey: ["receipts", contractId, address],
    queryFn: async () => {
      if (!contractId) throw new Error("receipt contract id not configured");
      if (!address) return 0n;
      return readContract<bigint>({
        contractId,
        method: "balance",
        args: [addrArg(address)],
        source: address,
      });
    },
    enabled: !!address && !!contractId,
    refetchInterval: 10_000,
  });
}
